// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {NFTCertificate} from "../src/NFTCertificate.sol";
import {CourseManager} from "../src/CourseManager.sol";

contract TestNFTCertificate is Test {
    NFTCertificate public nftCertificate;
    CourseManager public courseManager;
    
    address public student;
    address public courseCreator;
    string constant IPFS_URI = "ipfs://QmTest";

    function setUp() public {
        // Deploy contracts
        courseManager = new CourseManager();
        nftCertificate = new NFTCertificate(address(courseManager));
        
        // Setup addresses
        student = makeAddr("student");
        courseCreator = makeAddr("courseCreator");
        
        // Fund student for course purchase
        vm.deal(student, 1 ether);
    }

    function test_IssueCertificate() public {
        // Create a course
        vm.startPrank(courseCreator);
        courseManager.createCourse(
            "Solidity 101",
            0.1 ether,
            CourseManager.CourseCategory.Web3,
            CourseManager.CourseLevel.Beginner
        );
        vm.stopPrank();

        // Student buys the course
        vm.startPrank(student);
        courseManager.buyCourse{value: 0.1 ether}(0, courseCreator);
        vm.stopPrank();

        // Issue certificate
        nftCertificate.issueCourseBadgeNFT(
            student,
            0, // courseId
            courseCreator,
            IPFS_URI
        );

        // Verify NFT ownership
        assertEq(nftCertificate.ownerOf(0), student);
        
        // Verify token URI
        assertEq(nftCertificate.tokenURI(0), IPFS_URI);

        // Verify course details
        (
            uint256 courseId,
            address courseOwner,
            string memory courseName,
            CourseManager.CourseCategory category,
            CourseManager.CourseLevel level
        ) = nftCertificate.getCourseDetails(0);

        assertEq(courseId, 0);
        assertEq(courseOwner, courseCreator);
        assertEq(courseName, "Solidity 101");
        assertEq(uint256(category), uint256(CourseManager.CourseCategory.Web3));
        assertEq(uint256(level), uint256(CourseManager.CourseLevel.Beginner));
    }

    function test_RevertIfStudentNotEnrolled() public {
        // Create a course
        vm.startPrank(courseCreator);
        courseManager.createCourse(
            "Solidity 101",
            0.1 ether,
            CourseManager.CourseCategory.Web3,
            CourseManager.CourseLevel.Beginner
        );
        vm.stopPrank();

        // Try to issue certificate without buying course
        vm.expectRevert("Student has not purchased this course");
        nftCertificate.issueCourseBadgeNFT(
            student,
            0,
            courseCreator,
            IPFS_URI
        );
    }

    function test_RevertIfCourseDoesNotExist() public {
        // Try to issue certificate for non-existent course
        vm.expectRevert("No courses found for this owner");
        nftCertificate.issueCourseBadgeNFT(
            student,
            0,
            courseCreator,
            IPFS_URI
        );
    }

    function test_RevertIfTokenDoesNotExist() public {
        vm.expectRevert(abi.encodeWithSignature("ERC721NonexistentToken(uint256)", 0));
        nftCertificate.getCourseDetails(0);
    }

    function test_MultipleCertificates() public {
        // Create two courses
        vm.startPrank(courseCreator);
        courseManager.createCourse(
            "Solidity 101",
            0.1 ether,
            CourseManager.CourseCategory.Web3,
            CourseManager.CourseLevel.Beginner
        );
        courseManager.createCourse(
            "Advanced Smart Contracts",
            0.2 ether,
            CourseManager.CourseCategory.Web3,
            CourseManager.CourseLevel.Advanced
        );
        vm.stopPrank();

        // Student buys both courses
        vm.startPrank(student);
        courseManager.buyCourse{value: 0.1 ether}(0, courseCreator);
        courseManager.buyCourse{value: 0.2 ether}(1, courseCreator);
        vm.stopPrank();

        // Issue certificates for both courses
        nftCertificate.issueCourseBadgeNFT(
            student,
            0,
            courseCreator,
            IPFS_URI
        );

        nftCertificate.issueCourseBadgeNFT(
            student,
            1,
            courseCreator,
            string(abi.encodePacked(IPFS_URI, "2"))
        );

        // Verify both NFTs
        assertEq(nftCertificate.ownerOf(0), student);
        assertEq(nftCertificate.ownerOf(1), student);

        // Verify course details for both
        (,, string memory courseName1,,) = nftCertificate.getCourseDetails(0);
        (,, string memory courseName2,,) = nftCertificate.getCourseDetails(1);

        assertEq(courseName1, "Solidity 101");
        assertEq(courseName2, "Advanced Smart Contracts");
    }
}