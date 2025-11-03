# Prompts de Usuario por Sector
Vocabulario Específico para Análisis de Licitaciones

## Cómo poblar

Este documento sigue un proceso sistemático para integrar cada sector en el workflow de MP Licitaciones Baseline:

### 1. Extracción de Rubros (Catálogo)
- Usar `grep_search` con patrón `XX[0-9][0-9][0-9][0-9]` para encontrar rubros del sector
- Extraer 10 rubros representativos usando `read_file` con sus códigos completos
- Seleccionar rubros diversificados que cubran diferentes subcategorías del sector

### 2. Creación de Documentación (MD)
- Crear nueva sección numerada consecutivamente (ej: "## 18. NOMBRE SECTOR (XXxx)")
- Incluir vocabulario específico con sinónimos clave
- Listar términos aceptados del catálogo oficial
- Documentar 10 rubros específicos con sus códigos

### 3. Actualización de Workflow (JSON)
- Agregar opción al dropdown en `MP Licitaciones Baseline.json` (líneas 48-70)
- Usar formato: `"Nombre descriptivo del sector"` con valor `sector_identificador`
- Insertar rama condicional en `sectorPrompt` usando operador ternario
- Mantener orden numérico y sintaxis JSON correcta

### 4. Validación y Seguimiento
- Validar sintaxis JSON con `get_errors` después de cada cambio
- Actualizar contador de progreso: `XX/55 sectores completados (YY%)`
- Marcar sector como completado en checklist principal
- Actualizar todo list con下一 sector en secuencia

### 5. Patrón de Nomenclatura
- **Valor dropdown**: `sector_identificador` (minúsculas, guiones bajos)
- **Sección MD**: `## N. NOMBRE SECTOR (XXxx)`
- **Condicional**: `{{ $json.sector === "sector_identificador" ? "prompt_sector" : "siguiente_condicional" }}`

### 6. Estructura de Prompt
```
📚 SECTOR: NOMBRE DEL SECTOR

Sinónimos clave:
- término = sinónimo1 = sinónimo2 = variación1

Términos aceptados del catálogo oficial:
- Categoría principal: términos específicos, variantes, sinónimos
- Subcategorías: ejemplos concretos, aplicaciones especiales

Rubros específicos identificados:
- XXXXXXXX: Nombre del rubro
- ...
```

### 7. Sectores Pendientes
Siguiente sector a integrar: **27xx - Equipos y artículos de uso doméstico**


## Categorías principales

📈 **PROGRESO**: 26/55 sectores completados (47%)

- [x] 10xx - Agricultura y Materias Primas (168 rubros)
- [x] 11xx - Metales, Aleaciones y Materias Primas Industriales (39 rubros)
- [x] 12xx - Químicos (56 rubros)
- [x] 13xx - Caucho y resinas (9 rubros)
- [x] 14xx - Papel y productos de papel (12 rubros)
- [x] 15xx - Combustibles y lubricantes (10 rubros)
- [x] 20xx - Minería y extracción (20 rubros)
- [x] 21xx - Maquinaria agrícola y forestal (12 rubros)
- [x] 22xx - Maquinaria industrial (6 rubros)
- [ ] 23xx - Maquinaria para servicios
- [x] 24xx - Manejo de materiales (cubierto en Transporte)
- [x] 25xx - Vehículos (cubierto en Transporte)
- [ ] 26xx - Neumáticos y cámaras
- [ ] 27xx - Herramientas
- [x] 30xx - Construcción (cubierto en Construcción e Infraestructura)
- [ ] 31xx - Manufacturación
- [ ] 32xx - Componentes electrónicos
- [ ] 39xx - Equipamiento eléctrico
- [ ] 40xx - Equipamiento de distribución
- [ ] 41xx - Equipamiento de laboratorio
- [x] 42xx - Equipamiento médico (cubierto en Salud)
- [x] 43xx - Software (cubierto en Software y Tecnología)
- [ ] 44xx - Equipamiento de oficina
- [ ] 45xx - Equipamiento de imprenta
- [ ] 46xx - Equipamiento de defensa
- [ ] 47xx - Equipamiento de limpieza
- [ ] 48xx - Equipamiento deportivo
- [ ] 49xx - Equipamiento musical
- [ ] 50xx - Alimentos y bebidas
- [x] 51xx - Medicamentos (cubierto en Salud)
- [ ] 52xx - Productos domésticos
- [ ] 53xx - Vestuario
- [ ] 54xx - Artículos personales
- [ ] 55xx - Artículos impresos
- [ ] 56xx - Mobiliario
- [ ] 60xx - Instrumentos musicales
- [ ] 70xx - Servicios agrícolas
- [x] 72xx - Construcción e instalaciones (cubierto en Construcción e Infraestructura)
- [ ] 73xx - Servicios industriales
- [x] 76xx - Limpieza y residuos (cubierto en Construcción e Infraestructura)
- [ ] 77xx - Servicios ambientales
- [x] 78xx - Transporte (cubierto en Transporte y Logística)
- [ ] 80xx - Servicios de gestión
- [x] 81xx - Servicios TI (cubierto en Software y Tecnología)
- [x] 82xx - Telecomunicaciones (cubierto en Software y Tecnología)
- [ ] 83xx - Servicios públicos
- [ ] 84xx - Servicios financieros
- [x] 85xx - Salud (cubierto en Salud)
- [ ] 86xx - Servicios educativos
- [ ] 90xx - Servicios de viajes
- [ ] 91xx - Servicios personales
- [ ] 92xx - Servicios de seguridad
- [x] 93xx - Servicios políticos (cubierto en Salud)
- [ ] 94xx - Organizaciones y clubes
- [ ] 95xx - Terrenos y propiedades

---

## 1. AGRICULTURA Y MATERIAS PRIMAS

**Códigos de Rubro principales:** 10xxxxxx

### Prompt de Usuario 1:

```
📚 SECTOR: AGRICULTURA Y MATERIAS PRIMAS

Sinónimos clave:
- agricultura = agrícola = agropecuario = cultivo = producción agrícola = explotación agrícola
- ganadería = ganado = pecuario = crianza = producción animal = explotación ganadera
- materias primas = insumos agrícolas = productos agrícolas = recursos naturales

Términos aceptados del catálogo oficial:
- Animales: ganado, aves de corral, peces, animales domésticos, animales salvajes, insectos, mariscos, moluscos, crustáceos, mascotas
- Alimentos para animales: alimento para ganado, aves, peces, perros, gatos, roedores, reptiles
- Plantas y cultivos: árboles, arbustos, flores, plantas con flor, plantas sin flor, productos vegetales, semillas, almácigos, bulbos, tallos
- Semillas: cereales, hierbas, forraje, especias, flores, cultivos fibrosos, semilleros
- Insumos agrícolas: abonos orgánicos, abonos químicos, fertilizantes, pesticidas, herbicidas, repelentes de plagas, dispositivos para control de plagas
- Infraestructura animal: cobertizos, refugios, hábitats para animales, artículos de talabartería, arneses
- Residuos: residuos vegetales no alimentarios
- Servicios: administración agrícola, estudios de suelos y cultivos, economía agraria, catastros, derechos de aguas
- Veterinaria: accesorios y tratamientos para mascotas, productos veterinarios

Rubros específicos identificados:
- 10101500: Animales domésticos
- 10121500: Alimento para ganado
- 10161500: Árboles y arbustos
- 10171500: Abonos orgánicos
- 10171600: Abonos químicos
- 10171700: Herbicidas
- 10191500: Pesticidas o repelentes de plagas
- 10151500: Semillas y almácigos
```

---

## 2. METALES, ALEACIONES Y MATERIAS PRIMAS INDUSTRIALES

**Códigos de Rubro principales:** 11xxxxxx

### Prompt de Usuario 1:

```
📚 SECTOR: METALES, ALEACIONES Y MATERIAS PRIMAS INDUSTRIALES

Sinónimos clave:
- metales = metal = aleación = aleaciones = metalúrgico = siderúrgico
- acero = aceros = acería = productos siderúrgicos = estructuras metálicas
- minerales = mineral = minería = materias primas = recursos mineros = extracción

Términos aceptados del catálogo oficial:
- Aceros: aceros básicos, aceros rápidos, aceros especiales, estructuras de acero
- Metales base: hierro, aluminio, cobre, zinc, plomo, estaño, níquel
- Metales preciosos: oro, plata, platino, paladio
- Aleaciones: aleaciones ferrosas, aleaciones no ferrosas, bronces, latones
- Minerales: minerales metálicos, minerales no metálicos, tierras y suelos
- Productos metálicos: barras, perfiles, chapas, láminas, tubos, cañerías metálicas
- Materias primas: cuero, pieles, subproductos animales, tejidos naturales
- Textiles: tejidos de algodón, tejidos de seda, tejidos sintéticos, tejidos vegetales, tejidos especiales, telas no tejidas
- Desperdicios: desechos metálicos, desechos no metálicos, desperdicios orgánicos, chatarra, reciclaje de metales
- Cuerpos sólidos: lingotes, bloques, tochos, barras, perfiles estructurales

Rubros específicos identificados:
- 11171500: Aceros básicos
- 11171700: Aceros rápidos
- 11101600: Metales
- 11101700: Metales base
- 11101800: Metales preciosos
- 11101500: Minerales
- 11191500: Cuerpos sólidos de metal
- 11141600: Desechos no metálicos
- 11141700: Desperdicios orgánicos y de tabaco
- 11131500: Cuero, pieles y subproductos animales
```

---

## 3. QUÍMICOS Y PRODUCTOS QUÍMICOS

**Códigos de Rubro principales:** 12xxxxxx

### Prompt de Usuario 1:

```
📚 SECTOR: QUÍMICOS Y PRODUCTOS QUÍMICOS

Sinónimos clave:
- químicos = productos químicos = sustancias químicas = compuestos químicos = reactivos
- aditivos = aditivos químicos = aditivos industriales = mejoradores = estabilizadores
- explosivos = pirotecnia = materiales explosivos = pólvoras = detonantes

Términos aceptados del catálogo oficial:
- Aceites: aceites industriales, aceites lubricantes, aceites hidráulicos, aceites sintéticos
- Aditivos: aditivos para alimentos, aditivos para fármacos, aditivos para carburante, aditivos para pérdida de fluido
- Anti-productos: anti-sedimentos, anti-oxidantes, anti-congelantes, anti-corrosivos
- Compuestos: compuestos aromáticos, compuestos alifáticos, compuestos de colores, dispersiones, derivados orgánicos
- Explosivos: explosivos civiles, explosivos militares, pólvoras, detonantes, pirotecnia
- Gases: gases industriales, gases comprimidos, gases licuados, gases inertes, gases especiales
- Metales químicos: óxido de metales, óxido de metales raros, metales alcalinos, metales de transición
- Pinturas: pinturas industriales, recubrimientos, esmaltes, barnices, tintes, colorantes
- Productos químicos: ácidos, bases, sales, solventes, reactivos, catalizadores
- Polímeros: resinas, plásticos, elastómeros, polímeros sintéticos
- Productos de limpieza: detergentes industriales, desinfectantes, limpiadores químicos
- Tratamientos: tratamientos de agua, tratamientos de superficie, agentes de curado

Rubros específicos identificados:
- 12181600: Aceites
- 12164500: Aditivos para alimentos y fármacos
- 12162700: Aditivos para pérdida de fluido
- 12163100: Anti sedimentos
- 12162200: Anti-oxidantes
- 12352000: Compuestos aromáticos y alifáticos
- 12171700: Compuestos de colores y dispersiones
- 12131500: Explosivos
- 12141500: Óxido de metales
- 12141600: Óxido de metales raros
```

---

## 4. SOFTWARE Y TECNOLOGÍA

**Códigos de Rubro principales:** 81xxxxxx, 43xxxxxx, 82xxxxxx

### Prompt de Usuario 1:

```
📚 SECTOR: SOFTWARE Y TECNOLOGÍA

Sinónimos clave:
- software = licencias = sistemas = aplicaciones = programas = plataformas = soluciones informáticas

Términos aceptados del catálogo oficial:
- Servicios TI: desarrollo, mantención, soporte, mantenimiento, implementación, consultoría TI, arquitectura de software, integración, capacitación, asesoría técnica
- Productos software: licencias, Microsoft Office, Adobe, VMware, Red Hat, Oracle, SAP, AutoCAD, bases de datos, servidores, antivirus, firewalls
- Infraestructura: cloud, ciberseguridad, infraestructura TI, redes, telecomunicaciones, data centers, virtualización, almacenamiento
- Desarrollo: ingeniería de software, desarrollo web, desarrollo móvil, apps, portales, sistemas de información, ERP, CRM
- Actividades: instalación, configuración, actualización, migración, integración, parametrización, puesta en marcha
- Hardware relacionado: computadores, servidores, equipamiento informático, periféricos, impresoras, escáneres, monitores
- Gestión: administración de sistemas, gestión de proyectos TI, service desk, mesa de ayuda, soporte técnico
- Seguridad: ciberseguridad, seguridad informática, respaldo, backup, recuperación de desastres, protección de datos
- Comunicaciones: telecomunicaciones, telefonía IP, videoconferencia, redes, conectividad, cableado estructurado

Rubros específicos identificados:
- 81111800: Administración de sistemas
- 81112200: Licenciamiento de software
- 43231500: Software de aplicación
- 43232300: Software de desarrollo
- 81141500: Contratistas en tecnologías de la información
- 81101500 - 81102300: Servicios informáticos diversos
- 82111500 - 82111700: Telecomunicaciones
- 80111800: Consultorías TI
```

---

## 5. SALUD

**Códigos de Rubro principales:** 42xxxxxx, 51xxxxxx, 85xxxxxx, 93xxxxxx

### Prompt de Usuario 1:

```
📚 SECTOR: SALUD

Sinónimos clave:
- hospital = centro de salud = establecimiento de salud = consultorio = CESFAM = clínica = servicio de salud = centro médico = centro asistencial

Términos aceptados del catálogo oficial:
- Establecimientos: hospitales, clínicas, consultorios, CESFAM, SAR, SAPU, centro de salud ambulatoria, policlínicos, postas, unidades de emergencia
- Servicios médicos: atención médica, prestaciones de salud, servicios clínicos, atención primaria, atención secundaria, atención terciaria, emergencias, urgencias, telemedicina, teleradiología
- Equipamiento médico: electrocardiógrafo, electrocardiógrafo, rayos X, ecógrafo, tomógrafo, resonador, monitores médicos, desfibrilador, ventilador, camillas, camas clínicas, instrumental quirúrgico
- Diagnóstico: exámenes, laboratorio clínico, imagenología, radiología, rayos X, ecografía, tomografía, resonancia magnética, electrocardiografía
- Insumos: medicamentos, fármacos, drogas, material clínico, insumos hospitalarios, dispositivos médicos, jeringas, gasas, vendajes, guantes, mascarillas
- Personal: médicos, enfermeras, técnicos paramédicos, matronas, kinesiólogos, nutricionistas, psicólogos, terapeutas
- Especialidades: medicina interna, cirugía, pediatría, ginecología, obstetricia, traumatología, oftalmología, cardiología, neurología
- Procedimientos: cirugías, intervenciones, tratamientos, terapias, rehabilitación, diagnóstico, atención, consultas
- Servicios de apoyo: aseo hospitalario, alimentación hospitalaria, lavandería hospitalaria, esterilización, manejo de residuos hospitalarios
- Infraestructura: construcción hospitales, equipamiento hospitalar, mobiliario clínico, sistemas de gases medicinales

Rubros específicos identificados:
- 42xxxxxx: Instrumental y equipamiento médico
- 51xxxxxx: Medicamentos y productos farmacéuticos
- 85101500: Edificación de centros de atención de salud
- 85122200: Evaluación de salud
- 85131500: Mantenimiento de servicios de salud
- 85131600: Mantenimiento hospitalario
- 85121600 - 85122200: Servicios clínicos diversos
- 93131700: Limpieza de hospitales y servicios de salud
```

---

## 6. CONSTRUCCIÓN E INFRAESTRUCTURA

**Códigos de Rubro principales:** 30xxxxxx, 72xxxxxx, 76xxxxxx

### Prompt de Usuario 1:

```
📚 SECTOR: CONSTRUCCIÓN E INFRAESTRUCTURA

Sinónimos clave:
- construcción = edificación = obra = ejecución = proyecto = levantamiento = desarrollo de obra

Términos aceptados del catálogo oficial:
- Actividades: construcción, edificación, mejoramiento, habilitación, reposición, ampliación, remodelación, reparación, restauración, mantención, conservación, rehabilitación, normalización, terminación, instalación, montaje
- Obras civiles: puentes, túneles, viaductos, pasos sobre nivel, pasos bajo nivel, muros de contención, defensas fluviales
- Vialidad: carreteras, caminos, calles, avenidas, pasajes, veredas, aceras, bermas, ciclovías, pavimentación, carpeta asfáltica, hormigón, adoquines
- Edificaciones: edificios públicos, colegios, hospitales, consultorios, comisarías, cuarteles, oficinas, sedes sociales, gimnasios, estadios, multicanchas
- Infraestructura deportiva: estadios, gimnasios, multicanchas, canchas, piscinas, áreas deportivas, graderías, camarines, iluminación deportiva
- Infraestructura comunitaria: plazas, parques, áreas verdes, juegos infantiles, mobiliario urbano, bancas, luminarias
- Urbanización: loteos, urbanizaciones, habilitación de terrenos, movimiento de tierras, explanaciones, nivelación
- Instalaciones: eléctricas, sanitarias, agua potable, alcantarillado, drenaje, aguas lluvias, gas, telecomunicaciones
- Arquitectura: diseño arquitectónico, proyectos de arquitectura, planos, especificaciones técnicas, estudios de mecánica de suelos
- Especialidades: estructuras, fundaciones, muros, techumbres, cubiertas, terminaciones, revestimientos, pinturas, cerámicas, pisos
- Accesibilidad: accesibilidad universal, rampas, barandas, señalética, demarcación, vados peatonales

Rubros específicos identificados:
- 72xxxxxx: Servicios de edificación, construcción de instalaciones y mantenimiento
- 30xxxxxx: Componentes y suministros estructurales y de construcción
- 76xxxxxx: Servicios de limpieza, descontaminación y tratamiento de residuos
- 72131700: Construcción de edificios
- 72101900: Acabados de interiores
- 30222400: Componentes y sistemas para el techo
- 30222700: Estructuras y componentes de edificios
```

---

## 7. TRANSPORTE Y LOGÍSTICA

**Códigos de Rubro principales:** 78xxxxxx, 25xxxxxx, 24xxxxxx

### Prompt de Usuario 1:

```
📚 SECTOR: TRANSPORTE Y LOGÍSTICA

Sinónimos clave:
- transporte = traslado = movilización = servicio de transporte = arriendo de vehículos = servicio de movilización

Términos aceptados del catálogo oficial:
- Servicios de transporte: traslado, movilización, conducción, arriendo, servicios de transporte, transporte privado, transporte público, transporte escolar
- Tipos de pasajeros: escolares, estudiantes, adultos mayores, personal, funcionarios, trabajadores, pacientes, turistas, visitantes
- Modalidades: excursiones, giras, paseos, turismo, transfer, rutas, recorridos, itinerarios, circuitos, tours
- Personal: choferes, conductores, pilotos, operadores, despachadores, coordinadores de flota
- Vehículos pasajeros: buses, minibuses, furgones, vans, microbuses, colectivos, taxibuses, vehículos, móviles, automóviles
- Vehículos carga: camiones, camionetas, furgones de carga, tracto-camiones, remolques, semi-remolques
- Logística: distribución, despacho, reparto, entrega, envío, transporte de mercancías
- Carga: mercancía, fletes, carga, bultos, paquetes, encomiendas, mudanzas, traslado de equipos
- Gestión: administración de flotas, control de flota, seguimiento vehicular, GPS, telemetría, gestión de rutas
- Mantenimiento: mantención vehicular, reparación, servicio técnico, revisión técnica, cambio de aceite, neumáticos
- Combustibles: bencina, petróleo diesel, gas, combustible, abastecimiento, suministro
- Seguros: seguros vehiculares, SOAP, pólizas, coberturas

Rubros específicos identificados:
- 78101800: Servicios de transporte de pasajeros por carretera
- 78111800: Servicios de transporte escolar
- 78141500: Servicios de arriendo de vehículos
- 25xxxxxx: Vehículos comerciales, militares y particulares
- 24xxxxxx: Maquinaria y accesorios para manejo, acondicionamiento y almacenaje de materiales

---

## 8. CAUCHO Y RESINAS

**Códigos de Rubro principales:** 13xxxxxx

Sinónimos clave:
- caucho = goma = elastómero = hule
- resina = polímero = plástico = termoplástico = termoestable
- espuma = película = colofonia

Términos aceptados del catálogo oficial:
- Caucho natural, caucho sintético, elastómeros, colofonia, espumas, películas, plásticos termoestables, plásticos termoplásticos, resinas
- Productos: láminas de caucho, piezas moldeadas, juntas, sellos, mangueras, bandas, compuestos de caucho, aditivos para caucho
- Aplicaciones: industria automotriz, construcción, manufactura, embalaje, aislación, revestimientos, adhesivos
- Procesos: vulcanización, extrusión, moldeo, reciclaje de caucho y resinas

Rubros específicos identificados:
- 13101500: Caucho natural
- 13101600: Caucho sintético
- 13101700: Elastómeros
- 13111100: Colofonia
- 13111300: Espumas
- 13111200: Películas
- 13101900: Plásticos termoestables
- 13102000: Plásticos termoplásticos
- 13111000: Resinas

---

## 9. PAPEL Y PRODUCTOS DE PAPEL

**Códigos de Rubro principales:** 14xxxxxx

Sinónimos clave:
- papel = papelería = productos de papel = papel y cartón
- cartón = embalaje = packaging = cajas de cartón
- papel de imprenta = papel bond = papel offset = papel couché
- papel comercial = papel de oficina = papel para fotocopiadora

Términos aceptados del catálogo oficial:
- Materias primas del papel: pulpa, celulosa, fibras vegetales, papel reciclado
- Papeles de imprenta y escritura: papel bond, papel offset, papel couché, papel autocopiativo, papel térmico
- Papeles especiales: papel fantasía, papel seda, papeles laminados, papeles bañados, papel prensa
- Productos de papel: papel higiénico, toallas de papel, servilletas, pañuelos, productos de higiene personal
- Cartón y embalaje: cajas de cartón, cartón corrugado, embalajes, envases de papel y cartón
- Papeles industriales: papeles base sin bañar, papeles especiales de uso industrial
- Papeles comerciales: sobres, formularios, cuadernos, libretas, blocks, carpetas

Rubros específicos identificados:
- 14101500: Materias primas
- 14111500: Papel de imprenta y escritura
- 14111600: Papel fantasía
- 14111700: Productos de papel de uso personal
- 14111800: Papeles comerciales
- 14121500: Cartón y papel para embalaje
- 14121600: Papel seda
- 14121700: Papeles laminados
- 14121800: Papeles bañados
- 14121900: Papel prensa y offset
- 14122100: Papeles base sin bañar
- 14122200: Papeles especiales de uso industrial

---

## 10. COMBUSTIBLES Y LUBRICANTES

**Códigos de Rubro principales:** 15xxxxxx

Sinónimos clave:
- combustible = carburante = fuel = energético = combustóleo
- lubricante = aceite lubricante = lubricación = grasa = fluidos
- petróleo = derivados del petróleo = hidrocarburos = crudo
- gasoil = diesel = petróleo diesel = gasóleo = diésel

Términos aceptados del catálogo oficial:
- Combustibles líquidos: petróleo, gasoil, diesel, gasolina, bencina, kerosene, fuel oil, combustóleo, naftas
- Combustibles sólidos: carbón, coque, antracita, hulla, lignito, briquetas, pellets
- Combustibles gaseosos: gas natural, gas licuado, GLP, GNC, propano, butano, biogás
- Lubricantes: aceites lubricantes, aceites hidráulicos, aceites de motor, lubricantes industriales, lubricantes sintéticos
- Grasas: grasas lubricantes, grasas industriales, grasas automotrices, grasas de litio
- Aditivos: aditivos para carburante, mejoradores de combustible, estabilizadores, detergentes para combustibles
- Anticorrosivos: inhibidores de corrosión, protectores metálicos, anticorrosivos para combustibles
- Combustibles especiales: combustible nuclear, combustible de fisión, combustibles aeronáuticos
- Derivados: aceites minerales, parafinas, asfaltos, betunes, productos petroquímicos

Rubros específicos identificados:
- 15101500: Petróleo y derivados
- 15101600: Combustibles sólidos
- 15101700: Gasoil
- 15111500: Combustibles gaseosos
- 15111700: Aditivos para carburante
- 15121500: Lubricantes
- 15121800: Anticorrosivos
- 15121900: Grasas
- 15131500: Combustible nuclear
- 15131600: Combustible de fisión

---

## 11. MINERÍA Y EXTRACCIÓN

**Códigos de Rubro principales:** 20xxxxxx

Sinónimos clave:
- minería = explotación minera = extracción minera = operación minera
- perforación = perforación de pozos = drilling = perforación direccional
- equipo de perforación = equipo de prospección = brocas = barrenas
- producción de pozos = producción petrolera = extracción de hidrocarburos

Términos aceptados del catálogo oficial:
- Perforación: equipo de perforación, equipo de perforación direccional, equipo de prospección y perforación
- Herramientas de perforación: barrenas para rocas, brocas de barrena, equipo de corte
- Equipamiento de pozos: equipo de cabeza de pozo, equipo de terminación, equipamiento de terminación
- Producción: equipo de producción, bombas, bombas de exportación, deslizaderos de inyección de producción
- Control de flujo: contadores para medir flujo del pozo, calefactores para pozo
- Tratamiento de pozos: equipo acidificante, cemento para pozo petrolero
- Equipamiento auxiliar: accesorios de producción de barrenas hacia abajo, cribas y equipos de alimentación
- Servicios: perforación, terminación de pozos, estimulación, producción, mantenimiento
- Operaciones: prospección sísmica, perforación direccional, completamiento de pozos
- Materiales: cementos, ácidos, fluidos de perforación, aditivos químicos

Rubros específicos identificados:
- 20101500: Equipo de corte
- 20101600: Cribas y equipos de alimentación
- 20102100: Barrenas para rocas
- 20111500: Equipo de prospección y perforación
- 20121000: Equipo acidificante
- 20121400: Equipamiento de terminación
- 20121600: Brocas de barrena
- 20121800: Equipo de perforación direccional
- 20122100: Equipo de perforación
- 20122400: Equipo de producción
- 20131300: Cemento para pozo petrolero
- 20141000: Equipo de cabeza de pozo
- 20141300: Accesorios de producción de barrenas hacia abajo
- 20141400: Accesorios de producción de barrenas hacia abajo
- 20141500: Bombas
- 20141600: Bombas de exportación
- 20141800: Contadores para medir flujo del pozo
- 20142100: Calefactores para pozo
- 20142300: Deslizaderos de inyección de producción
- 20142700: Bombas

---

## 12. MAQUINARIA AGRÍCOLA Y FORESTAL

**Códigos de Rubro principales:** 21xxxxxx

Sinónimos clave:
- maquinaria agrícola = equipo agrícola = maquinaria agropecuaria = implementos agrícolas
- tractores = maquinaria agrícola = equipo de labranza = maquinaria de campo
- forestal = silvicultura = explotación forestal = manejo forestal
- acuicultura = pesca comercial = equipamiento pesquero = crianza de peces

Términos aceptados del catálogo oficial:
- Preparación del suelo: arado, rastra, subsolador, niveladora, cultivador, rotovator, maquinaria para preparación del suelo
- Siembra y plantación: sembradora, plantadora, trasplantadora, maquinaria para siembra, implementos de siembra directa
- Cosecha: cosechadora, segadora, trilladora, desgranadora, maquinaria para cosechar, equipos de recolección
- Procesamiento: maquinaria para limpieza, selección, clasificación, transformación agrícola, procesamiento de productos
- Riego: aspersores, sistemas de riego, equipos de riego agrícola, aspersores para agricultura, parques y jardines
- Ganadería: equipamiento para aves de corral y ganado, corrales, comederos, bebederos, equipos de ordeña
- Invernaderos: equipo para invernadero, estructuras de invernadero, control climático, sistemas hidropónicos
- Silvicultura: maquinaria para silvicultura, podadoras, motosierras, equipos forestales, explotación maderera
- Acuicultura: equipamiento para acuicultura, peceras, estanques, sistemas de oxigenación, alimentación de peces
- Pesca: equipamiento para pesca comercial, redes, embarcaciones pesqueras, equipos de procesamiento
- Producción especializada: equipo para crianza y producción de insectos, apicultura, sericultura

Rubros específicos identificados:
- 21101500: Maquinaria agrícola para preparación del suelo
- 21101600: Maquinaria agrícola para siembra
- 21101700: Maquinaria agrícola para cosechar
- 21101800: Aspersores para agricultura, parques y/o jardines
- 21101900: Equipamiento para aves de corral y ganado
- 21102000: Maquinaria agrícola para limpieza, selección o clasificación
- 21102100: Maquinaria para transformación agrícola
- 21102200: Maquinaria para silvicultura
- 21102300: Equipo para invernadero
- 21102400: Equipo para crianza y producción de insectos
- 21111500: Equipamiento para pesca comercial
- 21111600: Equipamiento para acuicultura

---

## 13. MAQUINARIA INDUSTRIAL

**Códigos de Rubro principales:** 22xxxxxx

Sinónimos clave:
- maquinaria industrial = equipo industrial = maquinaria pesada = maquinaria de construcción
- maquinaria pesada = equipo pesado = maquinaria de movimiento de tierras = construcción pesada
- pavimentación = asfaltado = construcción de carreteras = infraestructura vial
- elevadores = ascensores = montacargas = equipos de elevación

Términos aceptados del catálogo oficial:
- Maquinaria pesada: excavadoras, buldóceres, tractores, cargadores, retroexcavadoras, motoniveladoras
- Equipos de pavimentación: asfaltadoras, extendedoras, compactadoras, finisher, maquinaria para pavimentación
- Componentes: repuestos para maquinaria pesada, componentes para maquinaria pesada, partes industriales
- Equipo de elevación: elevadores, ascensores, montacargas, puentes grúa, grúas industriales
- Construcción: maquinaria para construcción de edificios, grúas torre, hormigoneras, andamios
- Demolición: maquinaria de demolición de edificios, martillos hidráulicos, trituradoras, equipos de demolición
- Movimiento de tierras: excavadoras, cargadores, buldóceres, motoniveladoras, compactadoras
- Infraestructura: maquinaria para obras civiles, construcción de carreteras, puentes, túneles
- Mantenimiento: equipos de mantenimiento industrial, herramientas neumáticas, equipos de soldadura
- Almacenamiento: montacargas, estanterías industriales, sistemas de almacenamiento

Rubros específicos identificados:
- 22101500: Maquinaria pesada
- 22101600: Equipos de pavimentación
- 22101700: Componentes para maquinaria pesada
- 22101800: Elevadores
- 22101900: Maquinaria para construcción de edificios
- 22102000: Maquinaria de demolición de edificios

---

## 14. MAQUINARIA PARA SERVICIOS

**Códigos de Rubro principales:** 23xxxxxx

Sinónimos clave:
- maquinaria para servicios = equipo de servicios = maquinaria de procesamiento = equipos especializados
- maquinaria para madera = equipos forestales = aserraderos = procesamiento de madera
- accesorios especiales = componentes industriales = dispositivos de guía = equipos de posicionamiento
- intercambio de iones = tratamiento de agua = purificación = filtración industrial

Términos aceptados del catálogo oficial:
- Procesamiento de madera: aserraderos, cepilladoras, canteadoras, clasificadoras, apiladoras, descortezadoras
- Equipos especializados: maquinaria para labrar metal, maquinaria industrial, componentes y accesorios
- Dispositivos de control: dispositivos de guía, posicionamiento y sujeción, accesorios especiales
- Tratamiento de fluidos: absorción e intercambio de iones, sistemas de purificación, tratamiento de agua
- Equipos de medición: instrumentos de precisión, equipos de control de calidad, dispositivos de medición
- Herramientas especializadas: accesorios de maquinaria, herramientas industriales, equipos de mantenimiento
- Sistemas de alimentación: alimentadores, transportadores, sistemas de dosificación
- Equipos de seguridad: dispositivos de protección, equipos de seguridad industrial
- Servicios de maquinaria: mantenimiento, reparación, calibración de equipos industriales
- Componentes industriales: piezas, repuestos, accesorios para maquinaria especializada

Rubros específicos identificados:
- 23201100: Absorción e intercambio de iones
- 23172000: Accesorios de maquinaria para labrar metal
- 23171900: Accesorios especiales
- 23231600: Apiladoras de maderos y accesorios
- 23231300: Canteadoras y accesorios
- 23231900: Cepilladoras y accesorios
- 23231500: Clasificadoras de maderos y accesorios
- 23153100: Componentes y accesorios para maquinaria industrial
- 23231000: Descortezadoras y accesorios
- 23153000: Dispositivos de guía, posicionamiento y sujeción

---

## 15. MATERIALES DE CONSTRUCCIÓN (24xx)

**Vocabulario y sinónimos:**
- **Materiales de construcción** = materiales de obra = productos de construcción = insumos de construcción
- **Embalaje** = packaging = envases = contenedores = embalajes industriales
- **Almacenamiento** = contención = depósito = guardar = almacenaje industrial
- **Transporte industrial** = carros industriales = carretillas = equipos de movilización
- **Refrigeración industrial** = congelación = conservación en frío = cámaras frigoríficas

**Términos aceptados del catálogo oficial:**
- **Embalaje y contenedores**: cajas, bolsas, sacos para envasado, cartón corrugado, contenedores para líquidos
- **Almacenamiento industrial**: arcones, cestas, cofres, armarios, baúles para almacenaje
- **Equipos de transporte**: camiones industriales, carros, carretillas industriales
- **Refrigeración**: congeladores industriales, equipos de conservación en frío
- **Materiales de protección**: acolchados para embalaje, materiales de amortiguamiento
- **Envases diversos**: botellas, bolsas, recipientes industriales
- **Estructuras de almacenamiento**: estanterías, racks, sistemas de organización
- **Equipamientos auxiliares**: herramientas de construcción, accesorios de obra
- **Materiales complementarios**: aditivos, selladores, productos de acabado
- **Sistemas de transporte**: bandas transportadoras, equipos de logística

**Rubros específicos identificados:**
- 24141600: Acolchados para embalaje
- 24112000: Arcones y cestas
- 24111500: Bolsas
- 24122000: Botellas
- 24121500: Cajas, bolsas y sacos para envasado
- 24101500: Camiones, carros y carretillas industriales
- 24112500: Cartón corrugado y otros materiales para embalaje
- 24112400: Cofres, armarios y baúles para almacenaje
- 24131600: Congeladores industriales
- 24112600: Contenedores para líquidos

---

## 16. VEHÍCULOS Y COMPONENTES DE TRANSPORTE (25xx)

**Vocabulario y sinónimos:**
- **Vehículos** = transporte = automotores = vehículos motorizados = medios de transporte
- **Aeronaves** = aviación = aeronáutica = aviones = helicópteros = aeronaves civiles y militares
- **Componentes vehiculares** = partes de vehículos = accesorios automotrices = repuestos = componentes de seguridad
- **Sistemas vehiculares** = sistemas de control = componentes eléctricos = interiores = acabados
- **Transporte especializado** = vehículos recreativos = bicicletas motorizadas = embarcaciones

**Términos aceptados del catálogo oficial:**
- **Aeronaves**: aeronaves de ala fija civil y militar, aeronaves de ala rotatoria, aeronaves especiales, aeronaves recreativas
- **Vehículos terrestres**: camiones, automóviles, bicicletas con motor, chasis para automóviles
- **Componentes de seguridad**: componentes de seguridad para vehículos, cinturones y arneses de seguridad, sistemas de protección
- **Sistemas eléctricos**: componentes eléctricos, sistemas de control ambiental, componentes de control ambiental para aviones
- **Componentes interiores**: componentes interiores para vehículos, asientos para vehículos, acabados exteriores
- **Accesorios especiales**: componentes para bicicletas, componentes y accesorios para embarcaciones
- **Sistemas de confort**: aire acondicionado, sistemas de climatización, componentes para el techo
- **Acumuladores y baterías**: acumuladores para aviones, sistemas de almacenamiento de energía
- **Componentes estructurales**: chasis, estructuras vehiculares, componentes de soporte
- **Equipos auxiliares**: componentes y sistemas especializados, equipos de navegación, instrumentos de control

**Rubros específicos identificados:**
- 25172600: Acabados exteriores para vehículos
- 25202700: Acumuladores para aviones
- 25131500: Aeronave de ala fija con motor
- 25131700: Aeronave de ala fija militar
- 25131600: Aeronave de ala rotatoria civil y comercial
- 25172700: Aire acondicionado
- 25174600: Asientos para vehículos
- 25101800: Bicicletas con motor
- 25102100: Camiones

---

## 17. COMPONENTES ELÉCTRICOS Y EQUIPAMIENTO ENERGÉTICO (26xx)

**Vocabulario y sinónimos:**
- **Componentes eléctricos** = equipos eléctricos = sistemas eléctricos = componentes de energía = equipamiento eléctrico
- **Generadores eléctricos** = generadores de energía = equipos de generación = centrales eléctricas = plantas de energía
- **Transmisión de energía** = distribución eléctrica = componentes de transmisión = sistemas de distribución = red eléctrica
- **Baterías y pilas** = almacenamiento de energía = células eléctricas = acumuladores = fuentes de alimentación
- **Equipamiento nuclear** = componentes nucleares = equipo radiactivo = sistemas de irradiación = combustible nuclear

**Términos aceptados del catálogo oficial:**
- **Componentes para motores**: accesorios y componentes para motores, piezas de motor, sistemas de propulsión
- **Sistemas eléctricos**: cables eléctricos y accesorios, conductores eléctricos, arneses eléctricos, sistemas de cableado
- **Generación de energía**: componentes para generadores, centrales eléctricas, componentes para transmisión de energía
- **Almacenamiento energético**: baterías, pilas y accesorios, sistemas de almacenamiento, acumuladores eléctricos
- **Equipamiento especializado**: equipo de irradiación, equipamiento para recintos radiactivos, equipo para combustible nuclear
- **Componentes mecánicos**: embragues, sistemas de transmisión, componentes de transmisión mecánica
- **Sistemas de combustión**: combustión interna, motores de combustión, sistemas térmicos
- **Equipamiento nuclear**: equipo para conjunto subcrítico, componentes radiactivos, sistemas de contención nuclear
- **Componentes industriales**: componentes eléctricos industriales, sistemas de control, equipos de monitoreo
- **Materiales conductores**: conductores eléctricos, materiales conductivos, componentes de conexión

**Rubros específicos identificados:**
- 26101700: Accesorios y componentes para motores
- 26121700: Arneses eléctricos
- 26111700: Baterías, pilas y accesorios
- 26121600: Cables eléctricos y accesorios
- 26131500: Centrales eléctricas
- 26101900: Combustión interna
- 26101800: Componentes para generadores
- 26111800: Componentes para transmisión de energía
- 26121500: Conductores eléctricos
- 26111900: Embragues
