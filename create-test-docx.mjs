import { Document, Packer, Table, TableRow, TableCell, Paragraph, BorderStyle } from "docx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a test DOCX document with a question table
const doc = new Document({
  sections: [
    {
      children: [
        new Paragraph({
          text: "Test Quiz Questions",
          heading: "Heading1",
        }),
        new Paragraph({
          text: "",
        }),
        new Table({
          width: {
            size: 100,
            type: "pct",
          },
          rows: [
            // Header row
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("Pregunta")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("Tipo")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("Opción A")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("Opción B")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("Opción C")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("Opción D")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("Respuesta Correcta")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("Explicación")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("Puntos")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
              ],
            }),
            // Question 1: Multiple Choice
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("¿Cuál es la capital de Francia?")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("MC")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("Londres")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("París")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("Berlín")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("Roma")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("B")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("La capital de Francia es París")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("10")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
              ],
            }),
            // Question 2: True/False
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("2+2=4")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("VF")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("Verdadero")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("Falso")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("A")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("Dos más dos es igual a cuatro")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("5")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
              ],
            }),
            // Question 3: Short Answer
            new TableRow({
              children: [
                new TableCell({
                  children: [new Paragraph("¿Cuál es la fórmula del agua?")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("SA")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("H2O")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("H2O")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("Agua es hidrógeno y oxígeno")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
                new TableCell({
                  children: [new Paragraph("8")],
                  borders: {
                    top: { style: BorderStyle.single, size: 1 },
                    bottom: { style: BorderStyle.single, size: 1 },
                    left: { style: BorderStyle.single, size: 1 },
                    right: { style: BorderStyle.single, size: 1 },
                  },
                }),
              ],
            }),
          ],
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(
    path.join(__dirname, "test-questions.docx"),
    buffer
  );
  console.log("✅ Test DOCX file created: test-questions.docx");
});
