export function felt252ToString(felt: any): string {
  if (!felt) return "";

  try {
    const bigIntValue = BigInt(felt);

    // If the value is 0, return empty string
    if (bigIntValue === 0n) return "";

    // Convert to hex and remove 0x prefix
    let hex = bigIntValue.toString(16);

    // Ensure even length
    if (hex.length % 2 !== 0) {
      hex = "0" + hex;
    }

    // Convert hex to ASCII string
    let str = "";
    for (let i = 0; i < hex.length; i += 2) {
      const charCode = parseInt(hex.substr(i, 2), 16);
      // Only add printable ASCII characters
      if (charCode >= 32 && charCode <= 126) {
        str += String.fromCharCode(charCode);
      }
    }

    return str.trim() || bigIntValue.toString();
  } catch (error) {
    // If conversion fails, return the string representation
    return felt.toString();
  }
}
