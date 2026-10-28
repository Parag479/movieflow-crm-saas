export function calculateGstTax(amountBeforeTax: number) {
  const cgst = amountBeforeTax * 0.09;
  const sgst = amountBeforeTax * 0.09;
  const totalAmount = amountBeforeTax + cgst + sgst;
  return { cgst, sgst, totalAmount };
}

export function calculateRevenueSplit(totalGross: number, distributorPercent: number) {
  const distributorShare = (totalGross * distributorPercent) / 100;
  const theaterShare = totalGross - distributorShare;
  return { distributorShare, theaterShare };
}

// Assertions runner
function testFinancials() {
  console.log("Running Financial & GST Unit Tests...");
  
  // Test 1: GST 18% Calculation
  const tax = calculateGstTax(1000000);
  if (tax.cgst !== 90000 || tax.sgst !== 90000 || tax.totalAmount !== 1180000) {
    throw new Error(`GST Test Failed: expected 1180000, got ${tax.totalAmount}`);
  }
  console.log("✔ GST 18% Tax Calculation Test Passed");

  // Test 2: Revenue Share 55/45 Split
  const split = calculateRevenueSplit(1000000, 55);
  if (split.distributorShare !== 550000 || split.theaterShare !== 450000) {
    throw new Error(`Revenue Split Test Failed: expected 550000/450000`);
  }
  console.log("✔ 55/45 Revenue Share Split Test Passed");
}

testFinancials();
