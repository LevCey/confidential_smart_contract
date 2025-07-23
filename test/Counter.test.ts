import { Counter, Counter__factory } from "../types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("Counter")) as Counter__factory;
  const counterContract = (await factory.deploy()) as Counter;
  const counterContractAddress = await counterContract.getAddress();

  return { counterContract, counterContractAddress };
}

describe("Counter", function () {
  let signers: Signers;
  let counterContract: Counter;
  let counterContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async () => {
    ({ counterContract, counterContractAddress } = await deployFixture());
  });

  it("should be deployed", async function () {
    expect(ethers.isAddress(counterContractAddress)).to.eq(true);
  });

  it("should start at 0", async function () {
    const count = await counterContract.getCount();
    expect(count).to.eq(0);
  });

  it("should increment correctly", async function () {
    await counterContract.increment(5);
    const count = await counterContract.getCount();
    expect(count).to.eq(5);
  });

  it("should decrement correctly", async function () {
    await counterContract.increment(10);
    await counterContract.decrement(4);
    const count = await counterContract.getCount();
    expect(count).to.eq(6);
  });

  it("should fail when decrementing below zero", async function () {
    await expect(counterContract.decrement(1)).to.be.revertedWith("Counter: cannot decrement below zero");
  });
});
