"use server"

import mammoth from "mammoth"
import { ExtractedQuestion } from "@/lib/types/docx"
import crypto from "crypto"

interface TableCell {
  text: string
}

interface TableRow {
  cells: TableCell[]
}

interface ParsedTable {
  rows: TableRow[]
}

export async function parseDocxFile(
  arrayBuffer: ArrayBuffer
): Promise<ExtractedQuestion[]> {
  try {
    console.log("Starting DOCX parsing, buffer size:", arrayBuffer.byteLength)

    // Usamos mammoth para extraer la estructura completa (con tablas)
    const fullResult = await extractDocxStructure(arrayBuffer)

    if (!fullResult.tables || fullResult.tables.length === 0) {
      throw new Error("No se encontraron tablas en el DOCX")
    }

    console.log("Found", fullResult.tables.length, "table(s) in DOCX")

    // Procesar la primera tabla encontrada
    const table = fullResult.tables[0]
    if (!table.rows || table.rows.length <= 1) {
      throw new Error("La tabla debe tener al menos una fila de encabezados y una fila de datos")
    }

    console.log("Table has", table.rows.length, "rows")

    // Parsear encabezados
    const headers = extractHeaders(table.rows[0])
    if (!headers) {
      throw new Error("No se pudo identificar los encabezados de la tabla")
    }

    console.log("Extracted headers:", Object.keys(headers))

    // Parsear filas de datos
    const questions: ExtractedQuestion[] = []
    for (let i = 1; i < table.rows.length; i++) {
      const row = table.rows[i]
      const question = parseTableRow(row, headers, i)

      if (question) {
        questions.push(question)
      }

      if (questions.length >= 100) {
        console.warn("Se alcanzó el límite de 100 preguntas")
        break
      }
    }

    if (questions.length === 0) {
      throw new Error("No se extrajeron preguntas válidas del DOCX")
    }

    console.log("Successfully parsed", questions.length, "questions from DOCX")
    return questions
  } catch (error: any) {
    console.error("Error parsing DOCX:", error)
    throw new Error(`Error al parsear DOCX: ${error.message}`)
  }
}

/**
 * Extrae la estructura completa del DOCX incluyendo tablas
 */
async function extractDocxStructure(arrayBuffer: ArrayBuffer): Promise<any> {
  try {
    // Usar mammoth para convertir a HTML (esto preserva la estructura de tablas)
    const buffer = Buffer.from(arrayBuffer)
    const htmlResult = await mammoth.convertToHtml({ buffer })
    
    if (!htmlResult.value) {
      throw new Error("No se pudo extraer HTML del DOCX")
    }

    console.log("Extracted HTML length:", htmlResult.value.length)

    // Parsear HTML para extraer tablas
    const tableData = parseHtmlTables(htmlResult.value)
    
    return tableData
  } catch (error: any) {
    console.error("Error in extractDocxStructure:", error)
    throw new Error(`Error extrayendo estructura DOCX: ${error.message}`)
  }
}

/**
 * Parsea tablas HTML extraídas por mammoth
 */
function parseHtmlTables(html: string): { tables: ParsedTable[] } {
  const tables: ParsedTable[] = []

  // Expresión regular para encontrar tablas
  const tableRegex = /<table[^>]*>(.*?)<\/table>/gis
  const rowRegex = /<tr[^>]*>(.*?)<\/tr>/gis
  const cellRegex = /<t[dh][^>]*>(.*?)<\/t[dh]>/gis

  let tableMatch
  while ((tableMatch = tableRegex.exec(html)) !== null) {
    const tableHtml = tableMatch[1]
    const rows: TableRow[] = []

    let rowMatch
    while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
      const rowHtml = rowMatch[1]
      const cells: TableCell[] = []

      let cellMatch
      while ((cellMatch = cellRegex.exec(rowHtml)) !== null) {
        const cellContent = cellMatch[1]
        // Limpiar HTML de la celda
        const text = stripHtml(cellContent).trim()
        cells.push({ text })
      }

      if (cells.length > 0) {
        rows.push({ cells })
      }
    }

    if (rows.length > 0) {
      tables.push({ rows })
    }
  }

  return { tables }
}

/**
 * Elimina etiquetas HTML de un string
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
}

/**
 * Extrae los encabezados de la tabla
 */
function extractHeaders(headerRow: TableRow): Record<string, number> | null {
  const headers: Record<string, number> = {}

  const expectedHeaders = [
    "pregunta",
    "tipo",
    "opción a",
    "opción b",
    "opción c",
    "opción d",
    "respuesta correcta",
    "explicación",
    "puntos",
  ]

  headerRow.cells.forEach((cell, index) => {
    const text = cell.text.toLowerCase().trim()

    // Mapear columnas por nombre
    if (text.includes("pregunta")) headers["pregunta"] = index
    else if (text.includes("tipo")) headers["tipo"] = index
    else if (text.includes("opción a") || text === "a") headers["opciona"] = index
    else if (text.includes("opción b") || text === "b") headers["opcionb"] = index
    else if (text.includes("opción c") || text === "c") headers["opcionc"] = index
    else if (text.includes("opción d") || text === "d") headers["opciond"] = index
    else if (text.includes("respuesta correcta")) headers["respuesta"] = index
    else if (text.includes("explicación")) headers["explicacion"] = index
    else if (text.includes("puntos")) headers["puntos"] = index
  })

  // Validar que tenemos las columnas mínimas obligatorias
  if (!("pregunta" in headers) || !("tipo" in headers)) {
    return null
  }

  return headers
}

/**
 * Parsea una fila de la tabla a pregunta estructurada
 */
function parseTableRow(
  row: TableRow,
  headers: Record<string, number>,
  rowIndex: number
): ExtractedQuestion | null {
  try {
    const getCellText = (headerKey: string): string => {
      const index = headers[headerKey]
      if (index === undefined || !row.cells[index]) return ""
      return row.cells[index].text.trim()
    }

    const pregunta = getCellText("pregunta")
    const tipoRaw = getCellText("tipo").toUpperCase()
    const opciona = getCellText("opciona")
    const opcionb = getCellText("opcionb")
    const opcionc = getCellText("opcionc")
    const opciond = getCellText("opciond")
    const respuestaRaw = getCellText("respuesta")
    const explicacion = getCellText("explicacion")
    const puntosRaw = getCellText("puntos")

    // Validar pregunta
    if (!pregunta) {
      return null
    }

    // Mapear tipo
    let tipo: "MC" | "VF" | "SA"
    if (tipoRaw.includes("MC") || tipoRaw.includes("MÚLTIPLE") || tipoRaw.includes("OPCIÓN")) {
      tipo = "MC"
    } else if (tipoRaw.includes("VF") || tipoRaw.includes("VERDADERO")) {
      tipo = "VF"
    } else if (tipoRaw.includes("SA") || tipoRaw.includes("CORTA")) {
      tipo = "SA"
    } else {
      return null // Tipo no reconocido
    }

    // Validar y construir opciones según tipo
    let opciones: Record<string, string> = {}
    let respuestaCorrecta = ""
    const errors: string[] = []

    if (tipo === "MC") {
      // Para MC, necesitamos al menos 2 opciones
      if (!opciona || !opcionb) {
        return null // MC sin opciones A y B
      }

      opciones = {
        a: opciona,
        b: opcionb,
        c: opcionc,
        d: opciond,
      }

      // Validar respuesta correcta
      const respuestaNormalizada = respuestaRaw.toUpperCase().trim()
      if (!["A", "B", "C", "D"].includes(respuestaNormalizada)) {
        errors.push(`Respuesta correcta inválida para MC: "${respuestaRaw}"`)
      } else {
        respuestaCorrecta = respuestaNormalizada
      }
    } else if (tipo === "VF") {
      // Para VF, la respuesta puede ser Verdadero/Falso, V/F, o A/B
      const respuestaNormalizada = respuestaRaw.toLowerCase().trim()
      
      let esVerdadero = false
      let esFalso = false
      
      if (["verdadero", "true", "v"].includes(respuestaNormalizada)) esVerdadero = true
      if (["falso", "false", "f"].includes(respuestaNormalizada)) esFalso = true
      
      if (respuestaNormalizada === "a" && opciona) {
         const op = opciona.toLowerCase().trim()
         if (["verdadero", "true", "v"].includes(op)) esVerdadero = true
         if (["falso", "false", "f"].includes(op)) esFalso = true
      }
      
      if (respuestaNormalizada === "b" && opcionb) {
         const op = opcionb.toLowerCase().trim()
         if (["verdadero", "true", "v"].includes(op)) esVerdadero = true
         if (["falso", "false", "f"].includes(op)) esFalso = true
      }

      if (esVerdadero) {
        respuestaCorrecta = "Verdadero"
      } else if (esFalso) {
        respuestaCorrecta = "Falso"
      } else {
        errors.push(`Respuesta correcta inválida para VF: "${respuestaRaw}"`)
      }
    } else if (tipo === "SA") {
      // Para SA, extraemos la respuesta correcta del DOCX
      respuestaCorrecta = respuestaRaw.trim()
    }

    const puntos = puntosRaw ? parseInt(puntosRaw) : 1
    if (isNaN(puntos) || puntos < 1 || puntos > 100) {
      errors.push(`Puntos inválidos: "${puntosRaw}"`)
    }

    const question: ExtractedQuestion = {
      id: crypto.randomUUID(),
      rowIndex,
      pregunta,
      tipo,
      opciones,
      respuestaCorrecta,
      explicacion: explicacion || undefined,
      puntos: isNaN(puntos) ? 1 : Math.min(puntos, 100),
      isValid: errors.length === 0,
      errors,
    }

    return question
  } catch (error) {
    console.error("Error parsing row:", error)
    return null
  }
}
