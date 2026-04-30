import { auth } from "@/lib/auth"
import { parseDocxFile } from "@/lib/services/docx-parser"
import { ParseDocxResponse } from "@/lib/types/docx"

/**
 * POST /api/teacher/quizzes/parse-docx
 * 
 * Parsea un archivo DOCX y extrae las preguntas de una tabla
 * 
 * Request:
 *   - file: File (DOCX)
 * 
 * Response:
 *   {
 *     success: boolean
 *     questions: ExtractedQuestion[]
 *     totalQuestions: number
 *     errors?: string[]
 *   }
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Validar autenticación
    const session = await auth()

    if (!session?.user || session.user.role !== "TEACHER") {
      return Response.json(
        { error: "No autorizado. Solo profesores pueden cargar cuestionarios." },
        { status: 401 }
      )
    }

    // Obtener archivo del request
    const formData = await request.formData()
    const file = formData.get("file") as File

    // Validaciones del archivo
    if (!file) {
      return Response.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    if (!file.name.endsWith(".docx")) {
      return Response.json(
        { error: "El archivo debe ser formato DOCX (.docx)" },
        { status: 400 }
      )
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: `El archivo no puede exceder ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    // Convertir archivo a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Parsear DOCX
    const questions = await parseDocxFile(arrayBuffer)

    const response: ParseDocxResponse = {
      success: true,
      questions,
      totalQuestions: questions.length,
    }

    return Response.json(response)
  } catch (error: any) {
    console.error("Error in parse-docx API:", error)

    return Response.json(
      {
        success: false,
        questions: [],
        errors: [error?.message || "Error desconocido al procesar DOCX"],
      },
      { status: 400 }
    )
  }
}
