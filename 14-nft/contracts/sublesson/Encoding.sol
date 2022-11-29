// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

contract Encoding {
    function combineStrings() public pure returns (string memory) {
        // return string(abi.encodePacked("Hi Mom!", "Miss you!"));
        return string.concat("Hi Mom!", "Miss you!");
    }

    function encodeNumber() public pure returns (bytes memory) {
        bytes memory number = abi.encode(1);
        return number;
    }

    function encodeString() public pure returns (bytes memory) {
        bytes memory someString = abi.encode("some string");
        return someString;
    }

    function encodeStringPacked() public pure returns (bytes memory) {
        bytes memory someString = abi.encodePacked("some string");
        return someString;
    }

    function decodeString() public pure returns (string memory) {
        string memory someString = abi.decode(encodeString(), (string));
        return someString;
    }

    function multiEncode() public pure returns (bytes memory) {
        bytes memory str = abi.encode("some string", "it is bigger");
        return str;
    }

    function multiDecode() public pure returns (string memory, string memory) {
        (string memory str1, string memory str2) = abi.decode(
            multiEncode(),
            (string, string)
        );
        return (str1, str2);
    }
}
