# Departamentos Tita

Sitio web para **Departamentos Tita** — arriendo de departamentos en el Condominio Puerto Pacífico, Viña del Mar. Propiedad de Dalal Saleme y Enrique Yanine, con más de 20 años de servicio excepcional.

## Tecnologías

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **MongoDB** (usuarios, departamentos, clientes)
- **Cloudinary** (fotos y videos)
- **NextAuth** (autenticación admin)
- **Framer Motion** (animaciones)

## Configuración

### 1. Variables de entorno

Copia `.env.local.example` a `.env.local` y ajusta si es necesario. El archivo `.env.local` ya está creado con:

- **MongoDB**: `ignaciorodriguezyanine_db_user` / contraseña proporcionada
- **Cloudinary**: API Key y Secret configurados
- **NextAuth**: Secret y URL

### 2. Instalar dependencias

```bash
npm install
```

### 3. Inicializar base de datos

Con el servidor corriendo (`npm run dev`), visita:

```
http://localhost:3000/api/seed
```

Esto crea:
- Usuario administrador: **dalal@vtr.net** / **Ignacio**
- Los 5 departamentos iniciales (4C Galápagos, 13D Cabo de Hornos, 17C Isla Grande, 16C y 18C Juan Fernández)

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura

- **Home**: Hero, historia (Dalal y Enrique), características del condominio Puerto Pacífico, departamentos
- **Departamentos**: Página individual por cada departamento con galería artística
- **Admin** (`/admin`): Panel para gestionar departamentos, subir fotos (Cloudinary), editar precios, layout tipo Canva
- **Clientes**: Consultas guardadas en MongoDB

## Panel de administración

- **URL**: `/admin`
- **Login**: dalal@vtr.net / Ignacio
- **Funciones**:
  - Editar departamentos (nombre, precio, descripción, fotos)
  - Subir fotos a Cloudinary
  - Editor de layout tipo Canva (tamaño, posición, disposición de imágenes y textos)
  - Ver clientes/consultas

## Despliegue (Vercel)

1. Conecta el repositorio a Vercel
2. Configura las variables de entorno (MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL, CLOUDINARY_*)
3. Deploy automático en cada push
