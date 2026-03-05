// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CharityNFT
 * @dev On-chain SVG NFT receipt minted for every donation — fully decentralized, no IPFS needed
 */
contract CharityNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIds;

    address public charityFundContract;

    struct Receipt {
        address donor;
        uint256 campaignId;
        uint256 amount;       // in wei
        uint256 timestamp;
        string campaignTitle;
        string badge;         // Bronze / Silver / Gold / Diamond
    }

    mapping(uint256 => Receipt) public receipts;

    // Badge thresholds in wei
    uint256 public constant BRONZE_MIN  = 0.001 ether;
    uint256 public constant SILVER_MIN  = 0.01 ether;
    uint256 public constant GOLD_MIN    = 0.1 ether;
    uint256 public constant DIAMOND_MIN = 1 ether;

    event ReceiptMinted(address indexed donor, uint256 indexed campaignId, uint256 tokenId, string badge);

    modifier onlyFundContract() {
        require(msg.sender == charityFundContract, "Only CharityFund can mint");
        _;
    }

    constructor() ERC721("CharityDonationReceipt", "CDR") {}

    function setFundContract(address _fund) external onlyOwner {
        charityFundContract = _fund;
    }

    /**
     * @dev Mint an NFT receipt to the donor
     */
    function mintReceipt(
        address _donor,
        uint256 _campaignId,
        uint256 _amount,
        string memory _campaignTitle
    ) external onlyFundContract returns (uint256) {
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        string memory badge = _getBadge(_amount);

        receipts[tokenId] = Receipt({
            donor: _donor,
            campaignId: _campaignId,
            amount: _amount,
            timestamp: block.timestamp,
            campaignTitle: _campaignTitle,
            badge: badge
        });

        _safeMint(_donor, tokenId);
        emit ReceiptMinted(_donor, _campaignId, tokenId, badge);
        return tokenId;
    }

    /**
     * @dev Determine badge tier based on donation amount
     */
    function _getBadge(uint256 _amount) internal pure returns (string memory) {
        if (_amount >= DIAMOND_MIN) return "Diamond";
        if (_amount >= GOLD_MIN)    return "Gold";
        if (_amount >= SILVER_MIN)  return "Silver";
        return "Bronze";
    }

    /**
     * @dev Returns badge color hex for SVG rendering
     */
    function _getBadgeColor(string memory badge) internal pure returns (string memory) {
        bytes32 h = keccak256(bytes(badge));
        if (h == keccak256("Diamond")) return "#a8d8ea";
        if (h == keccak256("Gold"))    return "#ffd700";
        if (h == keccak256("Silver"))  return "#c0c0c0";
        return "#cd7f32"; // Bronze
    }

    /**
     * @dev Fully on-chain SVG token URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");
        Receipt memory r = receipts[tokenId];

        string memory badgeColor = _getBadgeColor(r.badge);
        string memory amountEth = _weiToEthString(r.amount);

        string memory svg = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500">',
            '<defs>',
            '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:#0a0a1a;stop-opacity:1" />',
            '<stop offset="100%" style="stop-color:#1a0a2e;stop-opacity:1" />',
            '</linearGradient>',
            '<linearGradient id="badge" x1="0%" y1="0%" x2="100%" y2="100%">',
            '<stop offset="0%" style="stop-color:', badgeColor, ';stop-opacity:1" />',
            '<stop offset="100%" style="stop-color:#ffffff;stop-opacity:0.3" />',
            '</linearGradient>',
            '</defs>',
            '<rect width="400" height="500" fill="url(#bg)" rx="20"/>',
            '<rect x="10" y="10" width="380" height="480" fill="none" stroke="', badgeColor, '" stroke-width="2" rx="16" opacity="0.6"/>',
            // Logo/title area
            '<circle cx="200" cy="80" r="40" fill="url(#badge)" opacity="0.9"/>',
            '<text x="200" y="87" font-family="Arial" font-size="28" fill="#0a0a1a" text-anchor="middle" font-weight="bold">&#10084;</text>',
            '<text x="200" y="145" font-family="Arial" font-size="18" fill="#ffffff" text-anchor="middle" font-weight="bold">Donation Receipt</text>',
            '<text x="200" y="168" font-family="Arial" font-size="12" fill="', badgeColor, '" text-anchor="middle">', r.badge, ' Donor</text>',
            // Divider
            '<line x1="40" y1="185" x2="360" y2="185" stroke="', badgeColor, '" stroke-width="1" opacity="0.4"/>',
            // Campaign
            '<text x="40" y="215" font-family="Arial" font-size="11" fill="#888888">CAMPAIGN</text>',
            '<text x="40" y="235" font-family="Arial" font-size="14" fill="#ffffff" font-weight="bold">',
                _truncate(r.campaignTitle, 32),
            '</text>',
            // Amount
            '<text x="40" y="280" font-family="Arial" font-size="11" fill="#888888">AMOUNT DONATED</text>',
            '<text x="40" y="305" font-family="Arial" font-size="28" fill="', badgeColor, '" font-weight="bold">', amountEth, ' ETH</text>',
            // Campaign ID
            '<text x="40" y="345" font-family="Arial" font-size="11" fill="#888888">CAMPAIGN ID</text>',
            '<text x="40" y="363" font-family="Arial" font-size="13" fill="#ffffff">#', r.campaignId.toString(), '</text>',
            // Token ID
            '<text x="220" y="345" font-family="Arial" font-size="11" fill="#888888">TOKEN ID</text>',
            '<text x="220" y="363" font-family="Arial" font-size="13" fill="#ffffff">#', tokenId.toString(), '</text>',
            // Donor address
            '<text x="40" y="400" font-family="Arial" font-size="11" fill="#888888">DONOR</text>',
            '<text x="40" y="418" font-family="Arial" font-size="10" fill="#aaaaaa">', _addressToString(r.donor), '</text>',
            // Footer
            '<line x1="40" y1="440" x2="360" y2="440" stroke="', badgeColor, '" stroke-width="1" opacity="0.4"/>',
            '<text x="200" y="465" font-family="Arial" font-size="10" fill="#555555" text-anchor="middle">CharityFund Platform  |  Ethereum</text>',
            '<text x="200" y="482" font-family="Arial" font-size="9" fill="#444444" text-anchor="middle">This NFT is your immutable proof of generosity</text>',
            '</svg>'
        ));

        string memory json = Base64.encode(bytes(string(abi.encodePacked(
            '{"name":"Donation Receipt #', tokenId.toString(), '",',
            '"description":"On-chain proof of donation to ', r.campaignTitle, '. Badge: ', r.badge, '.",',
            '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(svg)), '",',
            '"attributes":[',
                '{"trait_type":"Badge","value":"', r.badge, '"},',
                '{"trait_type":"Campaign ID","value":"', r.campaignId.toString(), '"},',
                '{"trait_type":"Amount (ETH)","value":"', amountEth, '"},',
                '{"trait_type":"Platform","value":"CharityFund"}',
            ']}'
        ))));

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    // ------ Helpers ------

    function _weiToEthString(uint256 wei_) internal pure returns (string memory) {
        uint256 eth = wei_ / 1 ether;
        uint256 dec = (wei_ % 1 ether) / 1e14; // 4 decimal places
        return string(abi.encodePacked(eth.toString(), ".", _pad(dec, 4)));
    }

    function _pad(uint256 n, uint256 digits) internal pure returns (string memory) {
        string memory s = n.toString();
        bytes memory b = bytes(s);
        if (b.length >= digits) return s;
        string memory zeros = "";
        for (uint256 i = b.length; i < digits; i++) {
            zeros = string(abi.encodePacked("0", zeros));
        }
        return string(abi.encodePacked(zeros, s));
    }

    function _truncate(string memory s, uint256 maxLen) internal pure returns (string memory) {
        bytes memory b = bytes(s);
        if (b.length <= maxLen) return s;
        bytes memory result = new bytes(maxLen - 3);
        for (uint256 i = 0; i < maxLen - 3; i++) {
            result[i] = b[i];
        }
        return string(abi.encodePacked(result, "..."));
    }

    function _addressToString(address addr) internal pure returns (string memory) {
        bytes memory data = abi.encodePacked(addr);
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(2 + data.length * 2);
        str[0] = "0";
        str[1] = "x";
        for (uint256 i = 0; i < data.length; i++) {
            str[2 + i * 2]     = alphabet[uint8(data[i] >> 4)];
            str[3 + i * 2]     = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
}
