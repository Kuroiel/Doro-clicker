import { upgrades } from "../../src/scripts/Systems/upgrades.js";

// Since toRoman is not exported, we test it indirectly via individual upgrade names
// or we can test it by importing the function if we modify upgrades.js to export it.
// For now, let's verify visibility and naming consistency.

describe("Roman Numeral Naming Verification", () => {
  it("should have correctly named upgrades for multiples", () => {
    // We can't easily import toRoman if not exported. 
    // Let's check some generated upgrades.
    const upgrade10 = upgrades.find(u => u.id === "upg_strength_ac_lurking_doro_10");
    const upgrade25 = upgrades.find(u => u.id === "upg_strength_ac_lurking_doro_25");
    
    expect(upgrade10.name).toContain("Upgrade I");
    expect(upgrade25.name).toContain("Upgrade II");
  });
});
