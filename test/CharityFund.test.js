const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TrustChain Smart Contracts", function () {
  let charityNFT, charityFund;
  let owner, creator, donor1, donor2, donor3, donor4, otherUser;

  const minGoal = ethers.parseEther("0.01");
  const maxGoal = ethers.parseEther("100000");

  beforeEach(async function () {
    [owner, creator, donor1, donor2, donor3, donor4, otherUser] = await ethers.getSigners();

    // 1. Deploy CharityNFT
    const CharityNFT = await ethers.getContractFactory("CharityNFT");
    charityNFT = await CharityNFT.deploy();
    await charityNFT.waitForDeployment();

    // 2. Deploy CharityFund
    const CharityFund = await ethers.getContractFactory("CharityFund");
    charityFund = await CharityFund.deploy();
    await charityFund.waitForDeployment();

    // 3. Link contracts
    await charityFund.setNFTContract(await charityNFT.getAddress());
    await charityNFT.setFundContract(await charityFund.getAddress());
  });

  describe("Deployment and Initial Setup", function () {
    it("should set the correct owner", async function () {
      expect(await charityFund.owner()).to.equal(owner.address);
      expect(await charityNFT.owner()).to.equal(owner.address);
    });

    it("should link CharityNFT and CharityFund correctly", async function () {
      expect(await charityFund.nftContract()).to.equal(await charityNFT.getAddress());
      expect(await charityNFT.charityFundContract()).to.equal(await charityFund.getAddress());
    });

    it("should set default platform fee to 2.5% (250 basis points)", async function () {
      expect(await charityFund.platformFeePercent()).to.equal(250n);
    });
  });

  describe("Campaign Creation", function () {
    it("should create a campaign with valid parameters", async function () {
      const goal = ethers.parseEther("5");
      const durationDays = 30;

      const tx = await charityFund.connect(creator).createCampaign(
        "Clean Water Initiative",
        "Providing clean water filters to rural communities.",
        "Healthcare",
        "https://example.com/water.jpg",
        "QmHash12345",
        goal,
        durationDays
      );

      await expect(tx)
        .to.emit(charityFund, "CampaignCreated")
        .withArgs(1n, creator.address, "Clean Water Initiative", "Healthcare", goal, (await ethers.provider.getBlock("latest")).timestamp + durationDays * 86400);

      const campaign = await charityFund.getCampaign(1);
      expect(campaign.id).to.equal(1n);
      expect(campaign.creator).to.equal(creator.address);
      expect(campaign.title).to.equal("Clean Water Initiative");
      expect(campaign.category).to.equal("Healthcare");
      expect(campaign.goal).to.equal(goal);
      expect(campaign.raised).to.equal(0n);
      expect(campaign.active).to.equal(true);
      expect(campaign.status).to.equal(0); // Active
    });

    it("should revert if goal is below minimum or duration is invalid", async function () {
      await expect(
        charityFund.connect(creator).createCampaign(
          "Invalid Goal",
          "Description",
          "Other",
          "",
          "",
          ethers.parseEther("0.001"), // Below 0.01 ether
          30
        )
      ).to.be.revertedWith("Invalid goal");

      await expect(
        charityFund.connect(creator).createCampaign(
          "Invalid Duration",
          "Description",
          "Other",
          "",
          "",
          ethers.parseEther("1"),
          0 // 0 days
        )
      ).to.be.revertedWith("Invalid duration");
    });
  });

  describe("Donations and Tiered NFT Receipts", function () {
    beforeEach(async function () {
      await charityFund.connect(creator).createCampaign(
        "Save Rainforests",
        "Protecting endangered flora and fauna.",
        "Environment",
        "https://example.com/forest.jpg",
        "",
        ethers.parseEther("10"),
        60
      );
    });

    it("should allow donations and mint tiered NFT receipts", async function () {
      // 1. Bronze Tier donation (0.005 MNT >= 0.001 MNT)
      const bronzeAmount = ethers.parseEther("0.005");
      const tx1 = await charityFund.connect(donor1).donate(1, { value: bronzeAmount });
      await expect(tx1)
        .to.emit(charityFund, "DonationMade")
        .withArgs(1n, donor1.address, bronzeAmount, 1n, "Bronze");

      expect(await charityNFT.balanceOf(donor1.address)).to.equal(1n);
      expect(await charityNFT.ownerOf(1)).to.equal(donor1.address);

      // 2. Silver Tier donation (0.05 MNT >= 0.01 MNT)
      const silverAmount = ethers.parseEther("0.05");
      const tx2 = await charityFund.connect(donor2).donate(1, { value: silverAmount });
      await expect(tx2)
        .to.emit(charityFund, "DonationMade")
        .withArgs(1n, donor2.address, silverAmount, 2n, "Silver");

      // 3. Gold Tier donation (0.2 MNT >= 0.1 MNT)
      const goldAmount = ethers.parseEther("0.2");
      const tx3 = await charityFund.connect(donor3).donate(1, { value: goldAmount });
      await expect(tx3)
        .to.emit(charityFund, "DonationMade")
        .withArgs(1n, donor3.address, goldAmount, 3n, "Gold");

      // 4. Diamond Tier donation (2.0 MNT >= 1.0 MNT)
      const diamondAmount = ethers.parseEther("2.0");
      const tx4 = await charityFund.connect(donor4).donate(1, { value: diamondAmount });
      await expect(tx4)
        .to.emit(charityFund, "DonationMade")
        .withArgs(1n, donor4.address, diamondAmount, 4n, "Diamond");

      // Verify total raised
      const campaign = await charityFund.getCampaign(1);
      const totalExpected = bronzeAmount + silverAmount + goldAmount + diamondAmount;
      expect(campaign.raised).to.equal(totalExpected);
      expect(campaign.donorCount).to.equal(4n);

      // Verify on-chain SVG Token URI
      const uri = await charityNFT.tokenURI(4);
      expect(uri).to.include("data:application/json;base64,");
    });

    it("should update global statistics properly", async function () {
      const donation = ethers.parseEther("1.0");
      await charityFund.connect(donor1).donate(1, { value: donation });

      const stats = await charityFund.getStats();
      expect(stats.totalCampaigns).to.equal(1n);
      expect(stats.totalRaised).to.equal(donation);
      expect(stats.totalDonors).to.equal(1n);
    });
  });

  describe("Governance Voting", function () {
    beforeEach(async function () {
      await charityFund.connect(creator).createCampaign(
        "Community Library",
        "Building a public library with computers.",
        "Education",
        "",
        "",
        ethers.parseEther("5"),
        30
      );
    });

    it("should allow users to vote for or against a campaign", async function () {
      await charityFund.connect(donor1).vote(1, true);
      await charityFund.connect(donor2).vote(1, false);

      const campaign = await charityFund.getCampaign(1);
      expect(campaign.voteCount).to.equal(1n);
      expect(campaign.againstCount).to.equal(1n);
    });

    it("should revert if a user votes twice on the same campaign", async function () {
      await charityFund.connect(donor1).vote(1, true);
      await expect(charityFund.connect(donor1).vote(1, true)).to.be.revertedWith("Already voted");
    });
  });

  describe("Withdrawals & Platform Fees", function () {
    const goal = ethers.parseEther("2");

    beforeEach(async function () {
      await charityFund.connect(creator).createCampaign(
        "Solar Powered School",
        "Installing solar panels on school roofs.",
        "Technology",
        "",
        "",
        goal,
        10
      );
    });

    it("should allow the creator to withdraw when goal is reached and deduct 2.5% fee", async function () {
      // Donate full goal
      await charityFund.connect(donor1).donate(1, { value: goal });

      const initialCreatorBalance = await ethers.provider.getBalance(creator.address);

      const tx = await charityFund.connect(creator).withdraw(1);
      const receipt = await tx.wait();
      const gasSpent = receipt.gasUsed * receipt.gasPrice;

      const feePercent = 250n; // 2.5%
      const expectedFee = (goal * feePercent) / 10000n; // 0.05 ether
      const expectedCreatorAmount = goal - expectedFee; // 1.95 ether

      const finalCreatorBalance = await ethers.provider.getBalance(creator.address);
      expect(finalCreatorBalance).to.equal(initialCreatorBalance + expectedCreatorAmount - gasSpent);

      expect(await charityFund.totalPlatformFees()).to.equal(expectedFee);

      const campaign = await charityFund.getCampaign(1);
      expect(campaign.withdrawn).to.equal(true);
      expect(campaign.active).to.equal(false);
      expect(campaign.status).to.equal(3); // Withdrawn
    });

    it("should allow owner to withdraw accumulated platform fees", async function () {
      await charityFund.connect(donor1).donate(1, { value: goal });
      await charityFund.connect(creator).withdraw(1);

      const fees = await charityFund.totalPlatformFees();
      expect(fees).to.be.gt(0n);

      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      const tx = await charityFund.connect(owner).withdrawPlatformFees();
      const receipt = await tx.wait();
      const gasSpent = receipt.gasUsed * receipt.gasPrice;

      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance + fees - gasSpent);
      expect(await charityFund.totalPlatformFees()).to.equal(0n);
    });

    it("should revert withdrawal if caller is not the creator", async function () {
      await charityFund.connect(donor1).donate(1, { value: goal });
      await expect(charityFund.connect(otherUser).withdraw(1)).to.be.revertedWith("Not campaign creator");
    });
  });

  describe("Campaign Cancellation and Automatic Refunds", function () {
    const goal = ethers.parseEther("5");

    beforeEach(async function () {
      await charityFund.connect(creator).createCampaign(
        "Hospital Equipment",
        "Procuring medical ventilators.",
        "Healthcare",
        "",
        "",
        goal,
        30
      );
    });

    it("should refund donors when a campaign is cancelled", async function () {
      const donation1 = ethers.parseEther("1.0");
      const donation2 = ethers.parseEther("2.0");

      await charityFund.connect(donor1).donate(1, { value: donation1 });
      await charityFund.connect(donor2).donate(1, { value: donation2 });

      const donor1Before = await ethers.provider.getBalance(donor1.address);
      const donor2Before = await ethers.provider.getBalance(donor2.address);

      // Creator cancels campaign
      await charityFund.connect(creator).cancelCampaign(1);

      const donor1After = await ethers.provider.getBalance(donor1.address);
      const donor2After = await ethers.provider.getBalance(donor2.address);

      expect(donor1After).to.equal(donor1Before + donation1);
      expect(donor2After).to.equal(donor2Before + donation2);

      const campaign = await charityFund.getCampaign(1);
      expect(campaign.active).to.equal(false);
      expect(campaign.raised).to.equal(0n);
      expect(campaign.status).to.equal(2); // Cancelled
    });
  });
});
