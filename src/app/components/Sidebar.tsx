"use client";

// components/Sidebar.tsx
import { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { FaUser, FaUsers } from 'react-icons/fa';

interface SidebarProps {
  onSelectPrivateChat: (username: string) => void;
  onSelectGroupChat: (groupName: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelectPrivateChat, onSelectGroupChat }) => {
  const { users, groups, joinGroup } = useSocket();
  const [newGroupName, setNewGroupName] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'groups'>('users');

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    const result = await joinGroup(newGroupName);
    if (result.success) {
      setNewGroupName('');
      onSelectGroupChat(newGroupName);
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-1">
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md focus:outline-none ${
              activeTab === 'users' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <div className="flex items-center justify-center space-x-2">
              <FaUser />
              <span>Users</span>
            </div>
          </button>
          <button
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md focus:outline-none ${
              activeTab === 'groups' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setActiveTab('groups')}
          >
            <div className="flex items-center justify-center space-x-2">
              <FaUsers />
              <span>Groups</span>
            </div>
          </button>
        </div>
      </div>
      
      {activeTab === 'users' ? (
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Online Users
          </h3>
          {users.length === 0 ? (
            <p className="text-sm text-gray-500">No users online</p>
          ) : (
            <ul className="space-y-1">
              {users.map((user) => (
                <li key={user}>
                  <button
                    onClick={() => onSelectPrivateChat(user)}
                    className="w-full flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
                  >
                    <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3 text-left">
                      <p className="font-medium">{user}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <form onSubmit={handleJoinGroup} className="space-y-2">
              <input
                type="text"
                placeholder="Group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                required
              />
              <button
                type="submit"
                className="w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Join / Create Group
              </button>
            </form>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Available Groups
            </h3>
            {groups.length === 0 ? (
              <p className="text-sm text-gray-500">No groups available</p>
            ) : (
              <ul className="space-y-1">
                {groups.map((group) => (
                  <li key={group.name}>
                    <button
                      onClick={() => onSelectGroupChat(group.name)}
                      className="w-full flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100"
                    >
                      <div className="flex-shrink-0 h-8 w-8 bg-green-100 text-green-700 rounded-full flex items-center justify-center">
                        <FaUsers size={14} />
                      </div>
                      <div className="ml-3 text-left">
                        <p className="font-medium">{group.name}</p>
                        <p className="text-xs text-gray-500">{group.memberCount} members</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};