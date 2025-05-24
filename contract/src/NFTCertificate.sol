// SPDX LICENCE-Identifier: UNLICENSED
pragma solidity ^0.8.20;
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {CourseManager} from "./CourseManager.sol";

contract NFTCertificate is ERC721, ERC721URIStorage {
    uint256 private tokenCounter;
    CourseManager public courseManager;

    // Mapping from tokenId to courseId and courseOwner
    mapping(uint256 => uint256) public tokenToCourseId;
    mapping(uint256 => address) public tokenToCourseOwner;

    event CertificateIssued(
        address indexed student, 
        uint256 tokenId, 
        uint256 courseId,
        string courseName,
        CourseManager.CourseCategory category,
        CourseManager.CourseLevel level
    );

    constructor(address _courseManager) ERC721("CourseBadgeNFT", "CBNFT") {
        tokenCounter = 0;
        courseManager = CourseManager(_courseManager);
    }

    function issueCourseBadgeNFT(
        address student, 
        uint256 courseId,
        address courseOwner,
        string memory uri
    ) external {
        // Verify that the student has purchased the course
        CourseManager.Course memory course = courseManager.getCourseByCourseId(courseId, courseOwner);
        bool isStudent = false;
        for (uint256 i = 0; i < course.courseStudents.length; i++) {
            if (course.courseStudents[i] == student) {
                isStudent = true;
                break;
            }
        }
        require(isStudent, "Student has not purchased this course");

        // Mint the NFT
        uint256 newTokenId = tokenCounter;
        _safeMint(student, newTokenId);
        _setTokenURI(newTokenId, uri);

        // Store course information
        tokenToCourseId[newTokenId] = courseId;
        tokenToCourseOwner[newTokenId] = courseOwner;

        emit CertificateIssued(
            student, 
            newTokenId, 
            courseId,
            course.courseName,
            course.category,
            course.level
        );

        tokenCounter++;
    }

    function getCourseDetails(uint256 tokenId) external view returns (
        uint256 courseId,
        address courseOwner,
        string memory courseName,
        CourseManager.CourseCategory category,
        CourseManager.CourseLevel level
    ) {
        // This will revert if token doesn't exist
        ownerOf(tokenId);
        courseId = tokenToCourseId[tokenId];
        courseOwner = tokenToCourseOwner[tokenId];
        CourseManager.Course memory course = courseManager.getCourseByCourseId(courseId, courseOwner);
        return (
            courseId,
            courseOwner,
            course.courseName,
            course.category,
            course.level
        );
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}