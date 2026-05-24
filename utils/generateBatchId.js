export default function generateBatchId(
  date,
  silverRate,
  labourPerGram
) {

  const d = new Date(date);

  const day =
    String(d.getDate()).padStart(2, "0");

  const month =
    String(d.getMonth() + 1).padStart(2, "0");

  const year =
    d.getFullYear();

  // RATE ALWAYS 3 DIGIT

  const formattedRate =
    String(silverRate).padStart(3, "0");

  // LABOUR ALWAYS 3 DIGIT

  const formattedLabour =
    String(labourPerGram).padStart(3, "0");

  return `${day}${month}${year}${formattedRate}${formattedLabour}`;
}