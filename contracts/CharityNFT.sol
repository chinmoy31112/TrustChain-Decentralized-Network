// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CharityNFT
 * @dev On-chain SVG NFT receipt minted for every donation — fully decentralized
 * @notice Works on Mantle Network (MNT native token)
 */
contract CharityNFT is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Strings for uint256;

    uint256 private _tokenIdCounter;

    address public charityFundContract;

    struct Receipt {
        address donor;
        uint256 campaignId;
        uint256 amount;
        uint256 timestamp;
        string campaignTitle;
        string tier;
    }

    mapping(uint256 => Receipt) public receipts;
    mapping(address => uint256[]) public donorTokens;

    // Tier thresholds in wei (adjustable for MNT on Mantle)
    uint256 public bronzeMin  = 0.001 ether;
    uint256 public silverMin  = 0.01 ether;
    uint256 public goldMin    = 0.1 ether;
    uint256 public diamondMin = 1 ether;

    event ReceiptMinted(
        address indexed donor,
        uint256 indexed campaignId,
        uint256 indexed tokenId,
        string tier,
        uint256 amount
    );

    event FundContractUpdated(address oldContract, address newContract);
    event ThresholdsUpdated(uint256 bronze, uint256 silver, uint256 gold, uint256 diamond);

    modifier onlyFundContract() {
        require(msg.sender == charityFundContract, "Only CharityFund can mint");
        _;
    }

    constructor() ERC721("TrustChain Donation Receipt", "TCDR") Ownable(msg.sender) {}

    function setFundContract(address _fund) external onlyOwner {
        require(_fund != address(0), "Invalid address");
        address oldContract = charityFundContract;
        charityFundContract = _fund;
        emit FundContractUpdated(oldContract, _fund);
    }

    function setThresholds(
        uint256 _bronze,
        uint256 _silver,
        uint256 _gold,
        uint256 _diamond
    ) external onlyOwner {
        require(_bronze < _silver && _silver < _gold && _gold < _diamond, "Invalid thresholds");
        bronzeMin = _bronze;
        silverMin = _silver;
        goldMin = _gold;
        diamondMin = _diamond;
        emit ThresholdsUpdated(_bronze, _silver, _gold, _diamond);
    }

    /**
     * @dev Mint an NFT receipt to the donor
     */
    function mintReceipt(
        address _donor,
        uint256 _campaignId,
        uint256 _amount,
        string memory _tier
    ) external onlyFundContract nonReentrant returns (uint256) {
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;

        receipts[tokenId] = Receipt({
            donor: _donor,
            campaignId: _campaignId,
            amount: _amount,
            timestamp: block.timestamp,
            campaignTitle: "",
            tier: _tier
        });

        donorTokens[_donor].push(tokenId);

        _safeMint(_donor, tokenId);
        emit ReceiptMinted(_donor, _campaignId, tokenId, _tier, _amount);
        return tokenId;
    }

    /**
     * @dev Get tier based on amount
     */
    function getTier(uint256 _amount) public view returns (string memory) {
        if (_amount >= diamondMin) return "Diamond";
        if (_amount >= goldMin) return "Gold";
        if (_amount >= silverMin) return "Silver";
        return "Bronze";
    }

    /**
     * @dev Returns badge color hex for SVG rendering
     */
    function _getTierColor(string memory tier) internal pure returns (string memory) {
        bytes32 h = keccak256(bytes(tier));
        if (h == keccak256("Diamond")) return "#00D4AA";
        if (h == keccak256("Gold")) return "#FFD700";
        if (h == keccak256("Silver")) return "#C0C0C0";
        return "#CD7F32"; // Bronze
    }

    /**
     * @dev Get tier gradient for SVG
     */
    function _getTierGradient(string memory tier) internal pure returns (string memory, string memory) {
        bytes32 h = keccak256(bytes(tier));
        if (h == keccak256("Diamond")) return ("#00D4AA", "#7C3AED");
        if (h == keccak256("Gold")) return ("#FFD700", "#FFA500");
        if (h == keccak256("Silver")) return ("#C0C0C0", "#808080");
        return ("#CD7F32", "#8B4513"); // Bronze
    }

    /**
     * @dev Fully on-chain SVG token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        Receipt memory r = receipts[tokenId];

        string memory tierColor = _getTierColor(r.tier);
        (string memory gradStart, string memory gradEnd) = _getTierGradient(r.tier);
        string memory amountStr = _weiToString(r.amount);

        string memory svg = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">',
            '<defs>',
            '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:#0a0a1a"/>',
            '<stop offset="100%" style="stop-color:#1a0a2e"/>',
            '</linearGradient>',
            '<linearGradient id="tierGrad" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:', gradStart, '"/>',
            '<stop offset="100%" style="stop-color:', gradEnd, '"/>',
            '</linearGradient>',
            '<filter id="glow"><feGaussianBlur stdDeviation="3" result="coloredBlur"/>',
            '<feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
            '</defs>',
            '<rect width="400" height="500" fill="url(#bg)" rx="20"/>',
            '<rect x="10" y="10" width="380" height="480" fill="none" stroke="', tierColor, '" stroke-width="2" rx="16" opacity="0.6"/>'
        ));

        svg = string(abi.encodePacked(
            svg,
            '<circle cx="200" cy="80" r="45" fill="url(#tierGrad)" filter="url(#glow)"/>',
            '<text x="200" y="90" font-family="Arial,sans-serif" font-size="32" fill="#0a0a1a" text-anchor="middle" font-weight="bold">TC</text>',
            '<text x="200" y="150" font-family="Arial,sans-serif" font-size="20" fill="#ffffff" text-anchor="middle" font-weight="bold">Donation Receipt</text>',
            '<text x="200" y="175" font-family="Arial,sans-serif" font-size="14" fill="', tierColor, '" text-anchor="middle">', r.tier, ' Tier Donor</text>',
            '<line x1="40" y1="195" x2="360" y2="195" stroke="', tierColor, '" stroke-width="1" opacity="0.4"/>'
        ));

        svg = string(abi.encodePacked(
            svg,
            '<text x="40" y="230" font-family="Arial,sans-serif" font-size="11" fill="#888888">AMOUNT DONATED</text>',
            '<text x="40" y="260" font-family="Arial,sans-serif" font-size="28" fill="', tierColor, '" font-weight="bold">', amountStr, ' MNT</text>',
            '<text x="40" y="310" font-family="Arial,sans-serif" font-size="11" fill="#888888">CAMPAIGN ID</text>',
            '<text x="40" y="335" font-family="Arial,sans-serif" font-size="16" fill="#ffffff">#', r.campaignId.toString(), '</text>',
            '<text x="220" y="310" font-family="Arial,sans-serif" font-size="11" fill="#888888">TOKEN ID</text>',
            '<text x="220" y="335" font-family="Arial,sans-serif" font-size="16" fill="#ffffff">#', tokenId.toString(), '</text>'
        ));

        svg = string(abi.encodePacked(
            svg,
            '<text x="40" y="380" font-family="Arial,sans-serif" font-size="11" fill="#888888">DONOR</text>',
            '<text x="40" y="405" font-family="Arial,sans-serif" font-size="10" fill="#aaaaaa">', _addressToString(r.donor), '</text>',
            '<line x1="40" y1="430" x2="360" y2="430" stroke="', tierColor, '" stroke-width="1" opacity="0.4"/>',
            '<text x="200" y="455" font-family="Arial,sans-serif" font-size="11" fill="#555555" text-anchor="middle">TrustChain | Mantle Network</text>',
            '<text x="200" y="475" font-family="Arial,sans-serif" font-size="9" fill="#444444" text-anchor="middle">Immutable proof of your generosity</text>',
            '</svg>'
        ));

        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{"name":"TrustChain Receipt #', tokenId.toString(), '",',
            '"description":"On-chain proof of donation on Mantle Network. Tier: ', r.tier, '",',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '",',
            '"attributes":[',
            '{"trait_type":"Tier","value":"', r.tier, '"},',
            '{"trait_type":"Campaign ID","value":"', r.campaignId.toString(), '"},',
            '{"trait_type":"Amount (MNT)","value":"', amountStr, '"},',
            '{"trait_type":"Network","value":"Mantle"},',
            '{"trait_type":"Platform","value":"TrustChain"}',
            ']}'
        ))));

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    // View functions
    function getDonorTokens(address _donor) external view returns (uint256[] memory) {
        return donorTokens[_donor];
    }

    function getReceipt(uint256 _tokenId) external view returns (Receipt memory) {
        require(_ownerOf(_tokenId) != address(0), "Token does not exist");
        return receipts[_tokenId];
    }

    // Helper functions
    function _weiToString(uint256 wei_) internal pure returns (string memory) {
        uint256 whole = wei_ / 1 ether;
        uint256 decimal = (wei_ % 1 ether) / 1e14;

        string memory decStr = _padZeros(decimal, 4);
        return string(abi.encodePacked(whole.toString(), ".", decStr));
    }

    function _padZeros(uint256 n, uint256 digits) internal pure returns (string memory) {
        string memory s = n.toString();
        bytes memory b = bytes(s);
        if (b.length >= digits) return s;

        bytes memory result = new bytes(digits);
        uint256 padding = digits - b.length;

        for (uint256 i = 0; i < padding; i++) {
            result[i] = "0";
        }
        for (uint256 i = 0; i < b.length; i++) {
            result[padding + i] = b[i];
        }
        return string(result);
    }

    function _addressToString(address addr) internal pure returns (string memory) {
        bytes memory data = abi.encodePacked(addr);
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(data[i] >> 4)];
            str[3 + i * 2] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }

    // Required overrides
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
