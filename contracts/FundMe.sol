// SPDX-Licence-Identifier:MIT
pragma solidity ^0.8.7;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConvertor.sol";

error FundMe__NotOwner();

/** @title A contract for crowd func=ding
 *  @author Teerth Patel
 *  @notice This contract is to demo a sample funding contract
 *  @dev This implements price feeds as our library
 */
contract FundMe {
    // Type declarations
    using priceConvertor for uint256;

    // State variables
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] public s_funders;
    mapping(address => uint256) public s_amountFunded;
    address public immutable i_owner;

    AggregatorV3Interface public s_priceFeed;

    // modifier
    modifier onlyOwner() {
        // require(msg.sender == i_owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    // Function Order:
    //// contructor
    //// receive
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// view/pure

    constructor(address priceFeed) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeed);
    }

    // receive() external payable {
    //     fund();
    // }

    // fallback() external payable {
    //     fund();
    // }

    function fund() public payable {
        // require(msg.value>1e18,"Value should be greater than 1 eher");
        // 1e18 = 1*10**18 == 100000000000000000

        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Value should be greater than 1 ether"
        );
        s_funders.push(msg.sender);
        s_amountFunded[msg.sender] = msg.value;
    }

    function withdraw() public payable onlyOwner {
        // require(msg.sender==owner,"Only owner can access this");
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_amountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        // call
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess);
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_amountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool callSucess, ) = i_owner.call{value: address(this).balance}("");
        require(callSucess);
    }
}
