// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentRegistryERC8004
 * @dev A trustless agent standard registry that provides identity, reputation scores (1-100), and validation registries on-chain.
 */
contract AgentRegistryERC8004 {
    address public owner;

    struct Agent {
        string name;
        string endpoint;
        uint256 reputationScore; // Base scale: 1 to 100
        bool isValid;
    }

    mapping(address => Agent) public agents;

    event AgentRegistered(address indexed agentAddress, string name, string endpoint);
    event ReputationUpdated(address indexed agentAddress, uint256 newScore);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Registers a new agent profile to the ERC-8004 registry.
     * @param _agentAddress The public address representing the agent.
     * @param _name Display name of the agent.
     * @param _endpoint The API or routing endpoint of the agent payload.
     */
    function registerAgent(address _agentAddress, string memory _name, string memory _endpoint) external onlyOwner {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_endpoint).length > 0, "Endpoint cannot be empty");
        
        agents[_agentAddress] = Agent({
            name: _name,
            endpoint: _endpoint,
            reputationScore: 50, // Default starting reputation
            isValid: true
        });

        emit AgentRegistered(_agentAddress, _name, _endpoint);
    }

    /**
     * @dev Updates the reputation score of an active agent.
     * @param _agentAddress The address of the agent.
     * @param _newScore The updated reputation score (1-100).
     */
    function updateReputation(address _agentAddress, uint256 _newScore) external onlyOwner {
        require(_newScore >= 1 && _newScore <= 100, "Score must be between 1 and 100");
        require(agents[_agentAddress].isValid, "Agent is not valid or registered");
        
        agents[_agentAddress].reputationScore = _newScore;

        emit ReputationUpdated(_agentAddress, _newScore);
    }

    /**
     * @dev Revokes or reinstates an agent's valid status.
     * @param _agentAddress The address of the agent.
     * @param _status The new boolean status.
     */
    function setValidity(address _agentAddress, bool _status) external onlyOwner {
        agents[_agentAddress].isValid = _status;
    }
}
