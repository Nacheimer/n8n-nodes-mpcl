# MP Licitaciones Baseline Workflow

## Overview
n8n workflow that automates the process of searching, analyzing, and recommending Chilean public tenders (licitaciones) to PYME clients based on their business interests.

**Workflow File:** `MP Licitaciones Baseline.json`

---

## Workflow Plan (High-Level)

1. Manual Trigger. A must to init this.
2. We set the client-pyme params: company-name, company-email, tags. With a Set node.
2.1. tags are a list of words separated by commas.
3. We use the mercado público node n8n-nodes-mpcl, as websearch, to search for the most recent tenders, using the words from "tags" on step 2.
4. We pass the response from mercado público node (json response) and the client data from step 2, into an OpenAI node to analyze. OpenAI node must select the most appropiated tenders for the client based on the data on 2. LLM must return the list of recommended tenders for that company (up to 5).
5. We get that response, convert it into an HTML table, that contains: id, title, description, monto, fecha publicación, fecha cierre, link
6. Create a text for an email, with a heading saluting the company by company-name (step 2), informing it that this are the tenders we recommend for his company today. Then the tenders table from 5. And finally, a out greeting with our company: ACME Consulting.
Email should go to company-email
7. Ideally, we should be able to preview the email on 6, if manually check the workflow after being run.

---

## Technical Architecture

### Node Flow Diagram
```
Manual Trigger
    ↓
Set Client Data
    ↓
Search Tenders (Mercado Público API)
    ↓
Format Tenders for LLM (Code Node)
    ↓
Analyze with OpenAI (gpt-4o-mini)
    ↓
Parse LLM Response (Code Node)
    ↓
Convert to HTML Table (Code Node)
    ↓
Compose Email (Code Node)
    ↓
Send Email (SMTP)
```

### Detailed Node Descriptions

#### 1. Manual Trigger
- **Type:** `n8n-nodes-base.manualTrigger`
- **Purpose:** Initiates the workflow execution manually
- **Configuration:** Default settings
- **Output:** Empty trigger signal

---

#### 2. Set Client Data
- **Type:** `n8n-nodes-base.set`
- **Version:** 3.4
- **Purpose:** Defines client company parameters for the search and email
- **Configuration:**
  - **Mode:** Manual mapping
  - **Fields:**
    - `companyName` (string): Client company name
    - `companyEmail` (string): Recipient email address
    - `tags` (string): Space-separated keywords for tender search
- **Example Data:**
  ```json
  {
    "companyName": "Transportes Cordillera",
    "companyEmail": "eduardomellaramirez@gmail.com",
    "tags": "transporte pasajeros adultos mayores colegio escuela"
  }
  ```
- **Output:** Single item with client data fields

---

#### 3. Search Tenders
- **Type:** `n8n-nodes-mpcl.mercadoPublico` (Custom Node)
- **Version:** 1.0
- **Purpose:** Searches Chilean public tender database via Mercado Público API
- **Configuration:**
  - **Operation:** `webSearch`
  - **Region Code:** `7` (specific Chilean region)
  - **Search Text:** `={{ $json.tags }}` (dynamic from Set Client Data)
  - **Sort Order:** `3` (recent first)
  - **Retry on Fail:** Enabled
- **API Behavior:**
  - Uses web scraping to extract tender data from Mercado Público website
  - Returns structured JSON with tender details
- **Output Format:**
  ```json
  [
    {
      "id": "4475-25-LE25",
      "title": "Salidas educativas pedagógic Escuela Tres Esquinas",
      "description": "Salidas educativas pedagógicas para Escuela Tres Esquinas",
      "monto": "24.500.000",
      "fechaPublicacion": "08/10/2025",
      "fechaCierre": "08/10/2025",
      "organismo": "I.MUNICIPALIDAD DE ROMERAL",
      "estado": "Publicada y disponible para ofertar",
      "link": "http://www.mercadopublico.cl/..."
    }
  ]
  ```
- **Typical Output:** 10 tender items (API limit)

---

#### 4. Format Tenders for LLM
- **Type:** `n8n-nodes-base.code` (JavaScript)
- **Version:** 2
- **Purpose:** Transforms raw tender data into human-readable format for LLM analysis
- **Logic:**
  1. Receives all tender items from previous node
  2. Validates data presence (exits early if no tenders)
  3. Maps API fields to standardized format:
     - `id` → `codigo`
     - `title` → `nombre`
     - `description` → `descripcion`
     - `monto` (string "24.500.000") → `monto_estimado` (number 24500000)
     - `fechaPublicacion` → `fecha_publicacion`
     - `fechaCierre` → `fecha_cierre`
     - `organismo` → `organismo`
     - `estado` → `estado`
     - `link` → Mercado Público details URL, always constructed as:
       `https://www.mercadopublico.cl/Procurement/Modules/RFB/DetailsAcquisition.aspx?idlicitacion={codigo}`
  4. Converts monetary amounts from Chilean string format to numeric
  5. Generates formatted text with all tender details
- **Output:**
  ```json
  {
    "formatted": "Encontradas 10 licitaciones:\n\nLicitación 1:\n- Código: 4475-25-LE25\n...",
    "count": 10,
    "tenders": [...],
    "hasData": true
  }
  ```
- **Logging:** Extensive console.log for debugging (keys, samples, counts)

---

#### 5. Analyze with OpenAI
- **Type:** `@n8n/n8n-nodes-langchain.openAi`
- **Version:** 1.8
- **Purpose:** Uses GPT-4o-mini to analyze tenders and select the most relevant ones
- **Model:** `gpt-4o-mini`
  - Fast, cost-effective, excellent at following instructions
  - Replaces initial `gpt-5-nano` which was too restrictive
- **Credentials:** OpenAI API account
- **Prompt Structure:**
  - **System Message:** Defines role as Chilean tender analysis specialist
  - **User Message:**
    - Client data (company name, interests)
    - Formatted tender list from previous node
    - Relevance criteria (transport services, educational trips, student transport, etc.)
    - JSON response format specification
    - Instructions to copy exact codes, dates, amounts, and links
- **Response Format Required:**
  ```json
  {
    "licitaciones_relevantes": [
      {
        "id": "exact-tender-code",
        "title": "Full tender name",
        "description": "Summary (max 150 words)",
        "monto": 24500000,
        "fecha_publicacion": "08/10/2025",
        "fecha_cierre": "08/10/2025",
        "link": "http://www.mercadopublico.cl/..."
      }
    ]
  }
  ```
- **Output:** Single item with LLM response in `message.content`

---

#### 6. Parse LLM Response
- **Type:** `n8n-nodes-base.code` (JavaScript)
- **Version:** 2
- **Purpose:** Extracts and validates JSON response from OpenAI
- **Logic:**
  1. Receives LLM output item
  2. Extracts `matching_ids` array from `message.content` (handles both object and string types)
  3. Gets original tender data from Format Tenders for LLM node
  4. Filters tenders to only those whose `codigo` matches an ID in `matching_ids`
  5. Handles empty results (0 tenders):
    - Returns empty array or dummy item as needed
  6. Maps each tender to separate item for downstream processing
- **Error Handling:**
  - Throws descriptive errors if parsing fails
  - Logs all extraction steps and data structures
- **Output:** Array of tender items (0-5 items)
  ```json
  [
    {
      "id": "12345678-9",
      "title": "Servicio de transporte escolar...",
      "description": "Se requiere un proveedor...",
      "monto": 15000000,
      "fecha_publicacion": "01/09/2025",
      "fecha_cierre": "15/09/2025",
      "link": "http://www.mercadopublico.cl/..."
    }
  ]
  ```

---

#### 7. Convert to HTML Table
- **Type:** `n8n-nodes-base.code` (JavaScript)
- **Version:** 2
- **Purpose:** Generates HTML table from tender items
- **Logic:**
  1. Receives all tender items
  2. Checks for valid results (excludes `id: 'no-results'`)
  3. If no valid results:
     - Returns `{htmlTable: null, tenderCount: 0, hasResults: false}`
  4. If results exist:
     - Builds HTML table with inline styles
     - Escapes HTML entities in all text fields
     - Formats currency (Chilean peso with separators)
     - Creates clickable links
- **Table Structure:**
  ```html
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif;">
    <thead>
      <tr style="background-color: #f0f0f0;">
  <th>Código</th>
  <th>Nombre</th>
  <th>Descripción</th>
  <th>Monto Estimado</th>
  <th>Fecha Publicación</th>
  <th>Fecha Cierre</th>
  <th>Link</th>
      </tr>
    </thead>
    <tbody>
      <!-- Tender rows -->
    </tbody>
  </table>
  ```
- **Output:**
  ```json
  {
    "htmlTable": "<table>...</table>",
    "tenderCount": 5,
    "hasResults": true
  }
  ```
- **Logging:** Logs tender count, first tender data, result status

---

#### 8. Compose Email
- **Type:** `n8n-nodes-base.code` (JavaScript)
- **Version:** 2
- **Purpose:** Creates complete email with subject, HTML body, and plain text version
- **Logic:**
  1. Retrieves client data from "Set Client Data" node
  2. Receives table data from previous node
  3. Determines email type based on `hasResults` flag
  4. **If no results:**
     - Generates message: "No hemos encontrado licitaciones que se ajusten..."
     - Promises to continue monitoring
  5. **If results exist:**
     - Creates greeting with company name
     - Includes tender count
     - Embeds HTML table
     - Adds closing signature
  6. Generates both HTML and plain text versions
- **Email Structure (with results):**
  ```html
  <div style="font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto;">
    <h2>Hola {companyName},</h2>
    <p>Le informamos que hemos encontrado <strong>{count} licitaciones</strong> que recomendamos para su empresa:</p>
    {htmlTable}
    <br>
    <p>Saludos cordiales,<br><strong>ACME Consulting</strong></p>
  </div>
  ```
- **Output:**
  ```json
  {
    "to": "eduardomellaramirez@gmail.com",
    "subject": "Licitaciones recomendadas para Transportes Cordillera",
    "html": "<div>...</div>",
    "text": "Hola Transportes Cordillera,\n\n..."
  }
  ```
- **Logging:** Logs table data, company info, email type, HTML length

---

#### 9. Send Email
- **Type:** `n8n-nodes-base.emailSend`
- **Version:** 2.1
- **Purpose:** Sends composed email via SMTP
- **Configuration:**
  - **From Email:** `eduardo@attitude.cl` (verified sender)
  - **To Email:** `={{ $json.to }}` (dynamic from Compose Email)
  - **Subject:** `={{ $json.subject }}`
  - **Email Format:** `both` (HTML + plain text)
  - **Text:** `={{ $json.text }}`
  - **HTML:** `={{ $json.html }}`
- **SMTP Credentials:** Configured SMTP account
- **Behavior:**
  - Sends multipart email (both HTML and text versions)
  - Ensures compatibility across email clients
- **Output:** Email send confirmation

---

## Data Flow Summary

```
Client Input (tags: "transporte pasajeros adultos mayores")
    ↓
API Search (returns 10 raw tenders)
    ↓
Format (converts to structured data with proper field names and numeric amounts)
    ↓
LLM Analysis (gpt-4o-mini selects 5 most relevant)
    ↓
Parse JSON (extracts validated tender objects)
    ↓
Generate HTML (creates formatted table)
    ↓
Compose Email (builds complete message)
    ↓
Send SMTP (delivers to client inbox)
```

---

## Error Handling & Edge Cases

### 1. No Tenders Found (API returns empty)
- **Node:** Format Tenders for LLM
- **Behavior:** Returns `{formatted: "No se encontraron...", count: 0, hasData: false}`
- **Result:** Email sent with "no results" message

### 2. LLM Returns Empty Array
- **Node:** Parse LLM Response
- **Behavior:** Returns dummy `no-results` item
- **Result:** Email sent with "no results" message

### 3. LLM Response Parse Error
- **Node:** Parse LLM Response
- **Behavior:** Throws descriptive error with response preview
- **Result:** Workflow execution fails with detailed error message

### 4. Missing Client Data
- **Node:** Compose Email
- **Behavior:** Uses default values (`"Estimado cliente"`, empty email)
- **Result:** Email may fail at Send node due to invalid recipient

---

## Logging & Debugging

All critical nodes include extensive `console.log` statements for production monitoring:

### Format Tenders for LLM
- Items received count
- First item keys and sample (500 chars)
- Formatted tender count
- First formatted tender structure
- Formatted text length and preview

### Parse LLM Response
- Items received from LLM
- Response text extraction source
- Response length and preview
- JSON parse success/failure
- Tenders found count
- First tender structure

### Convert to HTML Table
- Tenders received count
- First tender data
- Valid results status
- HTML generation success

### Compose Email
- Table data received
- Company name and email
- Tender count
- Email type (with/without results)
- HTML body length

**Access Logs:** Open browser console (F12 → Console) during workflow execution to view all logs in real-time.

---

## Configuration Requirements

### Environment Variables
- None (all configuration is in node settings)

### Credentials Required
1. **OpenAI API:**
   - Account ID: `omq5BU8Tn3sj3tSp`
   - Model: `gpt-4o-mini`
   - Requires valid API key

2. **SMTP Account:**
   - Account ID: `UB4BWxwhDGzwlgTr`
   - Sender: `eduardo@attitude.cl`
   - Must be verified sender domain

### Custom Node Dependencies
- `n8n-nodes-mpcl` (Mercado Público custom node)
  - Version: 1.0
  - Operation: `webSearch`
  - Must be installed in n8n instance

---

## Performance Characteristics

- **Average Execution Time:** ~10-15 seconds
  - Search API: 2-3s
  - Format: <1s
  - OpenAI Analysis: 5-8s
  - Parse/Table/Email: <1s
  - SMTP Send: 1-2s

- **API Costs:**
  - Mercado Público: Free (public API)
  - OpenAI gpt-4o-mini: ~$0.001-0.003 per execution
  - SMTP: Depends on provider

- **Rate Limits:**
  - Mercado Público: Unknown (use retry on fail)
  - OpenAI: Depends on account tier
  - SMTP: Depends on provider

---

## Future Enhancements

1. **Scheduling:** Add cron trigger for daily/weekly automated execution
2. **Multi-Client:** Loop through client database instead of single manual input
3. **Database Storage:** Save recommended tenders to database for tracking
4. **Webhook Trigger:** Allow external systems to trigger analysis
5. **A/B Testing:** Compare different LLM prompts for better recommendations
6. **Analytics:** Track open rates, click-through rates on tender links
7. **Tender Tracking:** Monitor tender status changes and alert clients
8. **Custom Filtering:** Allow clients to set preference weights (price, deadline, etc.)

---

## Maintenance Notes

- **LLM Model:** Currently using `gpt-4o-mini` - proven more reliable than `gpt-5-nano`
- **Field Mapping:** If Mercado Público API changes field names, update "Format Tenders for LLM" node
- **Email Styling:** Inline CSS in table for maximum email client compatibility
- **Logging:** Keep enabled for production monitoring and troubleshooting
- **SMTP Sender:** Ensure `eduardo@attitude.cl` remains verified to avoid deliverability issues
