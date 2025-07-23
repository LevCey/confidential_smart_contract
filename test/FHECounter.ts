import { FHECounter, FHECounter__factory } from "../types";
import { FhevmInstance, FhevmType } from "@fhevm/hardhat-plugin";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
//import { getInstance } from "@fhevm/hardhat-plugin";
import hre from "hardhat";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
};

describe("FHECounter", function () {
  let signers: Signers;
  let fheCounter: FHECounter;
  let fhevmInstance: FhevmInstance;

  before(async function () {
    const ethSigners = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
    };

    // FHE instance başlat
    const fhevmInstance = await (hre as any).fhevm.getInstance(hre.ethers);
  });

  beforeEach(async function () {
    const factory = (await ethers.getContractFactory("contracts/FHECounter.sol:FHECounter")) as FHECounter__factory;
    fheCounter = (await factory.deploy()) as FHECounter;
    await fheCounter.waitForDeployment();
  });

  it("should be deployed", async function () {
    const address = await fheCounter.getAddress();
    expect(ethers.isAddress(address)).to.eq(true);
  });

  it("should increment the counter by 1 (FHE)", async function () {
    const publicKey = fhevmInstance.getPublicKey();

    // 1 sayısını şifrele
    const encOne = await fhevmInstance.encrypt32(1, publicKey);

    // Şifreli değeri gönder
    const tx = await fheCounter.increment(encOne, encOne.proof);
    await tx.wait();

    // getCount çağrısı ve sonucu çöz
    const result = await fheCounter.getCount();
    const decrypted = await fhevmInstance.decrypt(result);

    expect(decrypted).to.eq(1);
  });

  it("should decrement the counter by 1 (FHE)", async function () {
    const publicKey = fhevmInstance.getPublicKey();
    const encOne = await fhevmInstance.encrypt32(1, publicKey);

    // önce 1 artır
    await (await fheCounter.increment(encOne, encOne.proof)).wait();

    // sonra 1 azalt
    await (await fheCounter.decrement(encOne, encOne.proof)).wait();

    const result = await fheCounter.getCount();
    const decrypted = await fhevmInstance.decrypt(result);

    expect(decrypted).to.eq(0);
  });
});
