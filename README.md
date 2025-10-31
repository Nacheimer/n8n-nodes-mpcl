# n8n-mpcl: Mercado Público Custom Node

## English

This repository contains a custom n8n node for integrating with Chile's Mercado Público platform. It enables automated search, extraction, and analysis of public tenders, designed for SME client workflows.

- **Features:**
  - Search tenders using web scraping (webSearch operation)
  - Filter and analyze tenders with LLM integration
  - Generate HTML reports and email recommendations
  - Fully compatible with n8n workflow automation

## Usage

1. Install the node in your n8n instance.
2. Configure client parameters (company name, email, rubros, tags).
3. Use the `webSearch` operation to extract tenders.
4. Integrate with OpenAI for semantic filtering.
5. Generate and send email reports.

## License

This project is licensed under the terms described in [LICENSE.md](LICENSE.md).

---

# n8n-mpcl: Nodo Personalizado Mercado Público

## Español

Este repositorio contiene un nodo personalizado para n8n que permite integrar la plataforma Mercado Público de Chile. Facilita la búsqueda, extracción y análisis automatizado de licitaciones públicas, orientado a flujos de trabajo para clientes PYME.

- **Características:**
  - Búsqueda de licitaciones vía web scraping (operación webSearch)
  - Filtrado y análisis semántico con LLM
  - Generación de reportes HTML y envío de recomendaciones por correo
  - Totalmente compatible con la automatización de flujos en n8n

## Uso

1. Instale el nodo en su instancia de n8n.
2. Configure los parámetros del cliente (nombre empresa, correo, rubros, tags).
3. Utilice la operación `webSearch` para extraer licitaciones.
4. Integre con OpenAI para filtrado semántico.
5. Genere y envíe reportes por correo electrónico.

## Licencia

Este proyecto está licenciado bajo los términos descritos en [LICENCIA.md](LICENCIA.md).
