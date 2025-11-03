# Workflow Samples - Dynamic Fields

This document contains the dynamic fields that change between different workflow instances for MP Licitaciones Baseline.

## Baseline Workflow
**File**: `MP Licitaciones Baseline.json`

## Dynamic Fields Configuration

### 1. Company Information
- **Field**: `companyName`
- **Type**: String
- **Purpose**: Display name for the client in emails and communications

### 2. Contact Information
- **Field**: `companyEmail`
- **Type**: String
- **Purpose**: Email address for sending tender recommendations
- **Important**: Do not change emails - keep as they come from baseline### 3. Sector Selection
- **Field**: `sector`
- **Type**: String
- **Purpose**: Selects the appropriate sector-specific prompt vocabulary
- **Note**: The field includes a description with all valid values for easy reference
- **Available Values**:
  - `agricultura_materias_primas` - Agricultura y Materias Primas
  - `metales_aleaciones` - Metales, Aleaciones y Materias Primas Industriales
  - `quimicos` - Químicos y Productos Químicos
  - `caucho_resinas` - Caucho y resinas
  - `papel` - Papel y productos de papel
  - `combustibles` - Combustibles y lubricantes
  - `mineria` - Minería y extracción
  - `maquinaria_agricola` - Maquinaria agrícola y forestal
  - `maquinaria_industrial` - Maquinaria industrial
  - `maquinaria_servicios` - Maquinaria para servicios
  - `software` - Software y Tecnología
  - `salud` - Salud
  - `construccion` - Construcción e Infraestructura
  - `transporte` - Transporte y Logística
  - `materiales_construccion` - Materiales de construcción
  - `vehiculos_transporte` - Vehículos y componentes de transporte
  - `componentes_electricos` - Componentes eléctricos y equipamiento energético

### 4. Search Tags
- **Field**: `tags`
- **Type**: String
- **Purpose**: Keywords for matching tenders (comma separated)
- **Format**: Use comma-separated keywords without spaces after commas
- **Examples**:
  - Transport: "transporte,viajes,pasajeros,furgón,colectivo,traslado,escolares,adultos mayores,turismo,excursiones,rutas,movilidad,servicio privado,transfer,giras,estudiantiles"
  - Construction: "construcción de obras públicas,hospitales,edificación,infraestructura,obras civiles,mantenimiento,arquitectura,urbanización,caminos,licitaciones construcción"

### 5. Tender Rubros
- **Field**: `ruburos` (Note: typo in original field name - should be `rubros`)
- **Type**: String
- **Purpose**: Comma-separated list of Mercado Público rubro codes to filter tenders
- **Format**: "XXXXXX, XXXXXX, XXXXXX"
- **Examples**:
  - Transport: "78111800, 78101800"
  - Construction: "72131700, 30222400, 30222700"

## Sample Configurations

### Sample 1: Transportes Cordillera
```json
{
  "companyName": "Transportes Cordillera",
  "companyEmail": "eduardomellaramirez@gmail.com",
  "sector": "transporte",
  "tags": "transporte viajes pasajeros furgón colectivo traslado escolares adultos mayores turismo excursiones rutas movilidad servicio privado transfer giras estudiantiles",
  "ruburos": "78111800, 78101800"
}
```

### Sample 2: Construcción Cordillera
```json
{
  "companyName": "Construcción Cordillera",
  "companyEmail": "eduardomellaramirez@gmail.com",
  "sector": "construccion",
  "tags": "construcción de obras públicas,hospitales,edificación,infraestructura,obras civiles,mantenimiento,arquitectura,urbanización,caminos,licitaciones construcción",
  "ruburos": "72131700, 30222400, 30222700"
}
```

### Sample 3: Software Cordillera
```json
{
  "companyName": "Software Cordillera",
  "companyEmail": "eduardomellaramirez@gmail.com",
  "sector": "software",
  "tags": "desarrollo de software,ingeniería de software,mantención de software,sistemas,aplicaciones,web,móvil,consultoría TI,arquitectura de software,ciberseguridad",
  "ruburos": "81112200, 43231500, 43232300"
}
```

### Sample 4: Salud Cordillera
```json
{
  "companyName": "Salud Cordillera",
  "companyEmail": "eduardomellaramirez@gmail.com",
  "sector": "salud",
  "tags": "salud,hospitales,atención médica,clínicas,equipamiento médico,licitaciones salud pública,medicamentos,insumos hospitalarios,emergencias,atención primaria",
  "ruburos": "93131700, 85131500, 85122200"
}
```

## How to Create New Workflows

1. **Copy the baseline workflow**: `MP Licitaciones Baseline.json`
2. **Import to n8n**: Use the import feature in n8n
3. **Update the Set Client Data node** with new values:
   - Change `companyName` to the new client name
   - DO NOT change `companyEmail` (keep baseline email)
   - Select appropriate `sector` from dropdown
   - Customize `tags` with relevant keywords (comma-separated)
   - Set `ruburos` with specific Mercado Público codes (comma-separated with spaces)
4. **Save the workflow in n8n** with a new name

## ⚠️ Notas Importantes

1. **Formato de Tags**: Usar comas SIN espacios: `transporte,viajes,pasajeros`
2. **Formato de Ruburos**: Usar comas CON espacios: `78111800, 78101800`
3. **Email Estándar**: Todos los workflows usan `eduardomellaramirez@gmail.com`
4. **Sector**: Escribir el valor exacto del sector según la lista de valores válidos arriba
5. **Sector Prompt**: El prompt específico del sector se genera dinámicamente en el nodo LLM basado en el valor del campo `sector`. No es necesario configurarlo manualmente.
6. **Sticky Note**: El workflow incluye una nota adhesiva (Sticky Note) con todos los valores válidos de sector para fácil referencia y copiar/pegar

### What to Edit
Only edit these 4 fields in the "Set Client Data" node:
1. `companyName` - Change to your client name
2. `sector` - Select from dropdown (this auto-updates sectorPrompt)
3. `tags` - Update with comma-separated keywords
4. `ruburos` - Update with comma-separated rubro codes

### What NOT to Edit
- `companyEmail` - Always keep as `eduardomellaramirez@gmail.com`
- `sectorPrompt` - Leave as-is, even if it shows an error in UI

## Notes

- The `sectorPrompt` field is automatically generated based on the selected `sector` value
- All other workflow configuration remains the same
- Email templates and logic are preserved across all workflow instances
- The sector-specific vocabulary ensures better tender matching accuracy

## Rubro Code Reference

Common rubro categories:
- **78xxxxxx**: Transport services
- **72xxxxxx**: Construction services
- **30xxxxxx**: Construction materials
- **42xxxxxx**: Medical equipment
- **81xxxxxx**: IT services
- **85xxxxxx**: Health services

For complete rubro catalog, refer to: `../n8n-mpcl/data/rubros.catalog.json`
