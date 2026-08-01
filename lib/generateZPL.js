
export default function generateZPL(tags) {
  const START_X = [56, 206, 345];

  // Negative = moves print DOWN on your labels
  const Y_OFFSET = 290;

  let zpl = `
^XA
^MMT
^PW487
^LL799
^LS0
`;

  tags.forEach((tag, i) => {
    const x = START_X[i] - 74;

  zpl += `
// ---------------- PRODUCT DETAILS ----------------

^FT${110 + x},${255 + Y_OFFSET}
^A0B,23,23
^CI28
^FDNW :- ${tag.netWeight} GM^FS

^FT${139 + x},${255 + Y_OFFSET}
^A0B,23,23
^CI28
^FDSKU :- ${tag.sku}^FS

^FT${168 + x},${255 + Y_OFFSET}
^A0B,23,23
^CI28
^FDBID :- ${tag.bid}^FS


// ---------------- BRANDING ----------------

^FT${165 + x},${435 + Y_OFFSET}
^A0B,28,28
^CI28
^FD@ SIVAAH.IN^FS

^FT${108 + x},${545 + Y_OFFSET}
^A0B,17,18
^FB244,1,4,C
^CI28
^FDGET upto 20% Cashback^FS

^FT${129 + x},${545 + Y_OFFSET}
^A0B,17,18
^FB244,1,4,C
^CI28
^FDDM Us On Instagram^FS
`;
  });

  zpl += `
^PQ1,0,1,Y
^XZ
`;

  return zpl;
}