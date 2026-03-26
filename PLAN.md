# Plan: Sistema de Contenido Multimedia Adaptativo por Perfil de Aprendizaje

## Resumen Ejecutivo
Implementar un sistema completo de contenido multimedia que se adapte a los tres perfiles de aprendizaje (Visual, Auditivo, Kinestésico), con editor de bloques (TipTap) para profesores y visualización personalizada estilo Medium para estudiantes. Todo optimizado para Free Tier usando links externos.

---

## 🎯 Objetivos
1. **Contenido Visual:** Imágenes (links externos)
2. **Contenido Auditivo:** Videos de YouTube
3. **Contenido Kinestésico:** Quizzes inline de práctica no bloqueantes
4. **Editor:** Bloques modulares usando TipTap para texto y custom UI para media.
5. **Visualización:** Post-style rendering estilo Medium adaptado al perfil del estudiante.
6. **Diagnóstico:** Tomar el test una vez durante el registro del estudiante.

---

## 📐 Arquitectura
- Almacenamiento de contenido como `Json` estructurado en `Topic.content`
- Bloques independientes con metadata para filtrado por perfil

### Tipos de Datos (types/content.ts)
```typescript
export interface TopicContent {
  version: "1.0"
  blocks: ContentBlock[]
}

export type ContentBlock = TextBlock | ImageBlock | VideoBlock | QuizBlock

export interface BaseBlock {
  id: string
  profiles: ("Visual" | "Auditivo" | "Kinestesico")[]
}

export interface TextBlock extends BaseBlock {
  type: "text"
  content: string // HTML from TipTap or Markdown
}

export interface ImageBlock extends BaseBlock {
  type: "image"
  url: string
  caption?: string
  altText?: string
}

export interface VideoBlock extends BaseBlock {
  type: "video"
  youtubeId: string
  title?: string
}

export interface QuizBlock extends BaseBlock {
  type: "quiz"
  questionId: string // Reference to existing Question
}
```

---

## 📝 Fases de Implementación

### Fase 1: Infraestructura de Datos y Tipos (Actual)
- [x] Crear `PLAN.md`
- [ ] Actualizar `prisma/schema.prisma` (`Topic.content` a `Json`)
- [ ] Crear tipos `types/content.ts`
- [ ] Crear utilidades `lib/content-helpers.ts`
- [ ] Crear script de migración para contenido existente (de String a Json)

### Fase 2: Editor del Profesor (TipTap + Bloques)
- [ ] Construir componentes base de editor (`content-editor.tsx`, `block-toolbar.tsx`)
- [ ] Implementar `@dnd-kit` para reordenamiento
- [ ] Integrar TipTap para `TextBlock`
- [ ] Crear editores para imagen, video y quiz block
- [ ] Adaptar server actions para crear/actualizar JSON en lugar de strings

### Fase 3: Visualización del Estudiante (Estilo Medium)
- [ ] Crear renderer principal `topic-content-viewer.tsx`
- [ ] Implementar filtrado por `enrollment.studyProfile`
- [ ] Crear componentes de renderizado para texto, imagen, video y quiz
- [ ] Aplicar estilos tipográficos, espaciado y layout

### Fase 4: Test Diagnóstico en Registro
- [ ] Refactorizar `diagnostic-wizard.tsx` para ser utilizable en el flujo de registro.
- [ ] Modificar `register-form.tsx` o flujo post-registro para capturar perfil y guardarlo.
- [ ] Al enrolarse, asignar perfil inicial.

### Fase 5: Preguntas Kinestésicas Inline
- [ ] Extraer lógica de corrección a helper compartido `lib/quiz/check-answer.ts`
- [ ] Implementar componente `quiz-block.tsx` para feedback inmediato sin afectar base de datos
- [ ] Integrar selección de preguntas en el editor del profesor.

---

## 🛠 Entorno y Restricciones
- Bases de datos: Railway (PostgreSQL) - Mantener JSON en la tabla `Topic`.
- Almacenamiento: Sin storage propietario. Imágenes deben ser URLs externas. Videos de YouTube.
- Estructura: Mantener híbrido (Server actions para profe, API+SWR o Server actions directos si aplica para estudiante).
