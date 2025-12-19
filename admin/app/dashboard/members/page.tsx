'use client';

import { useState, useEffect } from 'react';
import { Users, Search, Filter, Mail, Phone, Calendar, Car, Edit, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  membership_id: string;
  role: string;
  rewards_balance: number;
  created_at: string;
  vehicle_count: number;
}

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/members/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const membersData = data.results || data;
        setMembers(Array.isArray(membersData) ? membersData : []);
      } else {
        console.error('Failed to load members');
        setMembers([]);
      }
    } catch (error) {
      console.error('Error loading members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = Array.isArray(members) ? members.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.membership_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesFilter;
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Members</h1>
          <p className="text-text-secondary">Manage member accounts and subscriptions</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Users className="w-4 h-4" />
          <span>{filteredMembers.length} members</span>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search by name, email, or membership ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-4 py-3 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="all">All Roles</option>
          <option value="member">Members</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Members List */}
      {filteredMembers.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <Users className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm || filterRole !== 'all' ? 'No members found' : 'No members yet'}
          </h3>
          <p className="text-text-secondary">
            {searchTerm || filterRole !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Members will appear here once they sign up.'}
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Member</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Membership ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Vehicles</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Rewards</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-background transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-foreground">{member.name || 'N/A'}</div>
                      <div className="text-sm text-text-muted capitalize">{member.role}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Mail className="w-4 h-4 text-text-muted" />
                        {member.email}
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm text-text-secondary">
                          <Phone className="w-4 h-4 text-text-muted" />
                          {member.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground font-mono">
                      {member.membership_id || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-text-muted" />
                      <span className="text-sm text-foreground">{member.vehicle_count || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gold">
                      {member.rewards_balance.toLocaleString()} pts
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Calendar className="w-4 h-4 text-text-muted" />
                      {new Date(member.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/members/${member.id}`)}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4 text-text-muted hover:text-gold" />
                      </button>
                      <button
                        onClick={() => router.push(`/dashboard/members/${member.id}/edit`)}
                        className="p-2 hover:bg-background rounded-lg transition-colors"
                        title="Edit member"
                      >
                        <Edit className="w-4 h-4 text-text-muted hover:text-gold" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
