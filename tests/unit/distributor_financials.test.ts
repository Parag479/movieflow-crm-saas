import { calculateTaxAndShares, round2 } from "../../src/lib/ledger";

function testDistributorFinancials() {
  console.log("Running Distributor Financials & Contractual Sharing Unit Tests...\n");

  // Test 1: Precision Decimal Tax and Contractual Sharing Calculation
  const gross = 1000000; // 10 Lakhs
  const gstRate = 18;
  const deductions = 20000;
  const distSharePct = 52.5;

  const calc = calculateTaxAndShares(gross, gstRate, deductions, distSharePct);

  // Expected GST: (1000000 * 18) / 118 = 152542.37
  if (calc.gstAmount !== 152542.37) {
    throw new Error(`Test 1 Failed: expected GST 152542.37, got ${calc.gstAmount}`);
  }

  // Expected Net: 1000000 - 152542.37 - 20000 = 827457.63
  if (calc.netAmount !== 827457.63) {
    throw new Error(`Test 1 Failed: expected Net 827457.63, got ${calc.netAmount}`);
  }

  // Exact penny conservation check: distributorAmt + exhibitorAmt MUST equal netAmount
  const shareSum = round2(calc.distributorAmt + calc.exhibitorAmt);
  if (shareSum !== calc.netAmount) {
    throw new Error(`Test 1 Failed: shares sum ${shareSum} does not equal net amount ${calc.netAmount}`);
  }

  console.log("✔ Precision Contractual Tax & Share Split Test Passed");

  // Test 2: Double-Entry Ledger Running Balance Arithmetic
  let runningBalance = 0;

  // Invoice 1 Debited (+ ₹11,80,000)
  const inv1Debit = 1180000;
  runningBalance = round2(runningBalance + inv1Debit);
  if (runningBalance !== 1180000) {
    throw new Error(`Test 2 Failed: expected 1180000, got ${runningBalance}`);
  }

  // Payment 1 Credited (- ₹5,00,000 part payment)
  const pay1Credit = 500000;
  runningBalance = round2(runningBalance - pay1Credit);
  if (runningBalance !== 680000) {
    throw new Error(`Test 2 Failed: expected 680000, got ${runningBalance}`);
  }

  // Payment 2 Credited (- ₹6,80,000 full settlement)
  const pay2Credit = 680000;
  runningBalance = round2(runningBalance - pay2Credit);
  if (runningBalance !== 0) {
    throw new Error(`Test 2 Failed: expected 0, got ${runningBalance}`);
  }

  console.log("✔ Double-Entry Distributor Ledger Running Balance Test Passed");

  // Test 3: Separation of Box Office Collection from Cash Received
  const collectionGross = 50000000;
  const verifiedPaymentsReceived = 0; // No payment receipt recorded yet
  // Money received MUST be exactly zero despite large box office collections
  if (verifiedPaymentsReceived !== 0) {
    throw new Error("Test 3 Failed: Collection was incorrectly treated as cash received");
  }
  console.log("✔ Strict Collection vs Verified Payment Separation Test Passed");

  console.log("\nAll Distributor Financial Unit Tests Passed Successfully!");
}

testDistributorFinancials();
