// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MedicineTrace {

    struct Batch {
        string batchId;
        string medicineName;
        string manufacturer;
        string ipfsHash;   // NEW
        address currentOwner;
        bool exists;
    }

    mapping(string => Batch) public batches;

    event BatchCreated(string batchId, address owner);
    event BatchTransferred(string batchId, address from, address to);

    function createBatch(
        string memory _batchId,
        string memory _medicineName,
        string memory _manufacturer,
        string memory _ipfsHash   // NEW
    ) public {
        require(!batches[_batchId].exists, "Batch already exists");

        batches[_batchId] = Batch(
            _batchId,
            _medicineName,
            _manufacturer,
            _ipfsHash,
            msg.sender,
            true
        );

        emit BatchCreated(_batchId, msg.sender);
    }

    function transferBatch(string memory _batchId, address _newOwner) public {
        require(batches[_batchId].exists, "Batch not found");
        require(batches[_batchId].currentOwner == msg.sender, "Not owner");

        batches[_batchId].currentOwner = _newOwner;

        emit BatchTransferred(_batchId, msg.sender, _newOwner);
    }

    function getBatch(string memory _batchId)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            address
        )
    {
        require(batches[_batchId].exists, "Batch not found");

        Batch memory b = batches[_batchId];

        return (
            b.batchId,
            b.medicineName,
            b.manufacturer,
            b.ipfsHash,
            b.currentOwner
        );
    }
}
