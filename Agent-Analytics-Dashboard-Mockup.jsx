import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  MessageSquare,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  Lock,
  Zap,
  Database,
  Settings,
  LogOut,
  Home,
  FileText,
  Target,
  Users,
  Activity,
  Crown,
  X,
  ChevronRight,
  MapPin,
  Bed,
  DollarSign,
} from 'lucide-react';

export default function AgentAnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showToast, setShowToast] = useState(null);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setShowToast(`Switched to ${tab}`);
    setTimeout(() => setShowToast(null), 2000);
  };

  const sidebarNavItems = [
    { id: 'overview', label: 'Overview', icon: Home, badge: null },
    { id: 'briefs', label: 'Incoming Briefs', icon: FileText, badge: '3' },
    { id: 'proposals', label: 'My Proposals', icon: Target, badge: null },
    { id: 'hunters', label: 'My Hunters', icon: Users, badge: null },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: null },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'crm', label: 'CRM Sync', icon: Database, badge: null },
    { id: 'profile', label: 'Profile', icon: Users, badge: null },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  // ==== OVERVIEW TAB ====
  const OverviewTab = () => (
    <div style={{ padding: '32px' }}>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #D4764E 0%, #C25A3A 100%)',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '32px',
          color: '#ffffff',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0' }}>
          Good morning, Sarah
        </h1>
        <p style={{ fontSize: '14px', margin: '0', opacity: 0.9 }}>
          Saturday, 12 April 2026 • You've got 3 new briefs waiting
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Active Briefs', value: '8', trend: '+2 this week' },
          { label: 'Proposals Sent', value: '23', trend: '+5 this month' },
          { label: 'Win Rate', value: '34%', trend: '+3% vs last month' },
          { label: 'Avg Response Time', value: '1.4 hrs', trend: '-15 mins improvement' },
        ].map((stat, idx) => (
          <div
            key={idx}
            style={{
              background: '#ffffff',
              border: '1px solid #E2E4EB',
              borderRadius: '16px',
              padding: '20px',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#999999', margin: '0 0 12px 0', textTransform: 'uppercase' }}>
              {stat.label}
            </p>
            <p style={{ fontSize: '32px', fontWeight: '800', color: '#000000', margin: '0 0 8px 0' }}>
              {stat.value}
            </p>
            <p style={{ fontSize: '12px', color: '#656565', margin: '0' }}>{stat.trend}</p>
          </div>
        ))}
      </div>

      {/* Incoming Briefs Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#000000', margin: '0 0 16px 0' }}>
          Incoming Briefs
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            {
              property: '42 Victoria Park Rd',
              type: '3-bed Victorian',
              location: 'E8 (Clapton)',
              price: '£485,000',
              beds: 3,
              received: '12 mins ago',
              match: 95,
            },
            {
              property: '15 Maple Street',
              type: '2-bed Flat',
              location: 'E8 (Walthamstow)',
              price: '£325,000',
              beds: 2,
              received: '1 hour ago',
              match: 87,
            },
            {
              property: 'Unit 7, The Mills',
              type: '1-bed Studio',
              location: 'E9 (Hackney)',
              price: '£295,000',
              beds: 1,
              received: '3 hours ago',
              match: 72,
            },
          ].map((brief, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #E2E4EB',
                borderRadius: '16px',
                padding: '20px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#000000', margin: '0' }}>
                    {brief.property}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#656565', margin: '4px 0 0 0' }}>
                    {brief.type}
                  </p>
                </div>
                <div
                  style={{
                    background: '#DCFCE7',
                    color: '#166534',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '700',
                  }}
                >
                  {brief.match}% match
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#656565', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={14} color="#D4764E" />
                  {brief.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DollarSign size={14} color="#D4764E" />
                  {brief.price}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#999999' }}>
                  <Clock size={14} />
                  {brief.received}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  style={{
                    background: '#ffffff',
                    border: '1px solid #D4764E',
                    color: '#D4764E',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#D4764E';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#ffffff';
                    e.currentTarget.style.color = '#D4764E';
                  }}
                  onClick={() => setShowToast(`Viewing brief: ${brief.property}`)}
                >
                  View Brief
                </button>
                <button
                  style={{
                    background: '#D4764E',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#C25A3A';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#D4764E';
                  }}
                  onClick={() => setShowToast(`Responding to: ${brief.property}`)}
                >
                  Respond
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#000000', margin: '0 0 16px 0' }}>
          Recent Activity
        </h2>
        <div style={{ background: '#ffffff', border: '1px solid #E2E4EB', borderRadius: '16px', padding: '20px' }}>
          {[
            { time: '12:34 PM', text: 'Owner connected — 42 Victoria Park Rd', icon: CheckCircle, color: '#10B981' },
            { time: '11:22 AM', text: 'Proposal viewed by owner — 15 Maple St', icon: Eye, color: '#3B82F6' },
            { time: '10:15 AM', text: 'New brief received — E8 area', icon: FileText, color: '#D4764E' },
            { time: '9:47 AM', text: 'Offer accepted — Unit 7, The Mills', icon: CheckCircle, color: '#10B981' },
          ].map((activity, idx) => {
            const IconComponent = activity.icon;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  paddingBottom: idx < 3 ? '16px' : '0',
                  borderBottom: idx < 3 ? '1px solid #E2E4EB' : 'none',
                }}
              >
                <IconComponent size={16} color={activity.color} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#000000', margin: '0', fontWeight: '500' }}>
                    {activity.text}
                  </p>
                  <p style={{ fontSize: '11px', color: '#999999', margin: '4px 0 0 0' }}>
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ==== ANALYTICS TAB ====
  const AnalyticsTab = () => (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#000000', margin: '0 0 32px 0' }}>
        Performance Analytics
      </h1>

      {/* Performance Metrics Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#000000', margin: '0 0 16px 0' }}>
          Your Performance
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {/* Commission vs Area Average */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #E2E4EB',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#000000', margin: '0' }}>
                Your Commission vs Area Average
              </h3>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#656565' }}>Your Rate</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#D4764E' }}>1.2%</span>
              </div>
              <div
                style={{
                  background: '#E2E4EB',
                  borderRadius: '8px',
                  height: '8px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    background: '#D4764E',
                    height: '100%',
                    width: '60%',
                  }}
                />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#656565' }}>Area Avg</span>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#999999' }}>1.4%</span>
              </div>
              <div
                style={{
                  background: '#E2E4EB',
                  borderRadius: '8px',
                  height: '8px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    background: '#999999',
                    height: '100%',
                    width: '70%',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Response Time Trend */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #E2E4EB',
              borderRadius: '16px',
              padding: '20px',
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#000000', margin: '0 0 16px 0' }}>
              Response Time Trend
            </h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '100px' }}>
              {[45, 42, 38, 32, 28].map((val, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    background: '#D4764E',
                    borderRadius: '6px',
                    height: `${(val / 50) * 100}%`,
                    minHeight: '8px',
                    opacity: 0.6 + idx * 0.08,
                  }}
                  title={`${val} mins`}
                />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'].map((w, idx) => (
                <span key={idx} style={{ fontSize: '10px', color: '#999999' }}>
                  {w}
                </span>
              ))}
            </div>
          </div>

          {/* Win Rate by Property Type */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #E2E4EB',
              borderRadius: '16px',
              padding: '20px',
              gridColumn: '1 / -1',
            }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#000000', margin: '0 0 16px 0' }}>
              Win Rate by Property Type
            </h3>
            {[
              { type: 'Houses', rate: 42 },
              { type: 'Flats', rate: 28 },
              { type: 'New Build', rate: 55 },
            ].map((item, idx) => (
              <div key={idx} style={{ marginBottom: idx < 2 ? '16px' : '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#656565' }}>
                    {item.type}
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#D4764E' }}>
                    {item.rate}%
                  </span>
                </div>
                <div
                  style={{
                    background: '#E2E4EB',
                    borderRadius: '8px',
                    height: '10px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      background: '#D4764E',
                      height: '100%',
                      width: `${item.rate}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Your Ranking */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #E2E4EB',
              borderRadius: '16px',
              padding: '20px',
              gridColumn: '1 / -1',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#000000', margin: '0' }}>
                Your Ranking in E8
              </h3>
              <Crown size={16} color="#D4764E" />
            </div>
            <p style={{ fontSize: '24px', fontWeight: '800', color: '#D4764E', margin: '0 0 8px 0' }}>
              #3 of 47
            </p>
            <div
              style={{
                background: '#E2E4EB',
                borderRadius: '8px',
                height: '12px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  background: '#D4764E',
                  height: '100%',
                  width: '94%',
                }}
              />
            </div>
            <p style={{ fontSize: '11px', color: '#999999', margin: '8px 0 0 0' }}>
              Top 7% of agents in your area
            </p>
          </div>
        </div>
      </div>

      {/* Market Intelligence Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#000000', margin: '0' }}>
            Market Intelligence
          </h2>
          <Lock size={14} color="#999999" />
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#999999', textTransform: 'uppercase' }}>
            Premium
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {[
            { label: 'Avg Commission in E8', value: '1.35%', icon: DollarSign },
            { label: 'Avg Days to Offer', value: '43 days', icon: Clock },
            { label: 'Most Active Type', value: '2-bed flats', icon: Bed },
            { label: 'Briefs Sent This Month', value: '127', icon: FileText },
          ].map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                style={{
                  background: '#ffffff',
                  border: '1px solid #E2E4EB',
                  borderRadius: '16px',
                  padding: '20px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <IconComponent size={16} color="#D4764E" />
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#999999', margin: '0', textTransform: 'uppercase' }}>
                    {item.label}
                  </p>
                </div>
                <p style={{ fontSize: '20px', fontWeight: '800', color: '#000000', margin: '0' }}>
                  {item.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ==== CRM SYNC TAB ====
  const CRMSyncTab = () => (
    <div style={{ padding: '32px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#000000', margin: '0 0 32px 0' }}>
        CRM Integration Hub
      </h1>

      {/* Status Panel */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #E2E4EB',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#000000', margin: '0 0 8px 0' }}>
              Reapit Foundations
            </h2>
            <p style={{ fontSize: '13px', color: '#656565', margin: '0' }}>
              Your primary CRM connection
            </p>
          </div>
          <div
            style={{
              background: '#DCFCE7',
              color: '#166534',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <CheckCircle size={14} />
            Connected
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'Last Sync', value: '2 minutes ago' },
            { label: 'Contacts Synced', value: '234' },
            { label: 'Properties Synced', value: '18' },
          ].map((stat, idx) => (
            <div key={idx}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#999999', margin: '0 0 6px 0', textTransform: 'uppercase' }}>
                {stat.label}
              </p>
              <p style={{ fontSize: '18px', fontWeight: '800', color: '#000000', margin: '0' }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Log */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#000000', margin: '0 0 16px 0' }}>
          Sync Activity
        </h2>
        <div style={{ background: '#ffffff', border: '1px solid #E2E4EB', borderRadius: '16px', padding: '20px' }}>
          {[
            { time: '2 mins ago', text: 'Status update received ← Reapit: Viewing confirmed', icon: CheckCircle, color: '#10B981' },
            { time: '14 mins ago', text: 'New lead pushed → Reapit: 42 Victoria Park Rd', icon: TrendingUp, color: '#3B82F6' },
            { time: '1 hour ago', text: 'Sync completed — 18 contacts updated', icon: Database, color: '#D4764E' },
            { time: '3 hours ago', text: 'New lead pushed → Reapit: 15 Maple St', icon: TrendingUp, color: '#3B82F6' },
          ].map((activity, idx) => {
            const IconComponent = activity.icon;
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  paddingBottom: idx < 3 ? '16px' : '0',
                  borderBottom: idx < 3 ? '1px solid #E2E4EB' : 'none',
                }}
              >
                <IconComponent size={16} color={activity.color} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', color: '#000000', margin: '0', fontWeight: '500' }}>
                    {activity.text}
                  </p>
                  <p style={{ fontSize: '11px', color: '#999999', margin: '4px 0 0 0' }}>
                    {activity.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#000000', margin: '0 0 16px 0' }}>
          Sync Settings
        </h2>
        <div style={{ background: '#ffffff', border: '1px solid #E2E4EB', borderRadius: '16px', padding: '20px' }}>
          {[
            { label: 'Auto-push new leads', enabled: true },
            { label: 'Sync viewing updates', enabled: true },
            { label: 'Sync offer status', enabled: false },
          ].map((setting, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: idx < 2 ? '16px' : '0',
                borderBottom: idx < 2 ? '1px solid #E2E4EB' : 'none',
              }}
            >
              <p style={{ fontSize: '13px', fontWeight: '500', color: '#000000', margin: '0' }}>
                {setting.label}
              </p>
              <div
                style={{
                  background: setting.enabled ? '#D4764E' : '#D9DCE4',
                  borderRadius: '20px',
                  width: '44px',
                  height: '24px',
                  position: 'relative',
                  cursor: 'pointer',
                }}
                onClick={() => setShowToast(`Toggled: ${setting.label}`)}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: setting.enabled ? '22px' : '2px',
                    width: '20px',
                    height: '20px',
                    background: '#ffffff',
                    borderRadius: '50%',
                    transition: 'left 0.2s ease',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available CRMs */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#000000', margin: '0 0 16px 0' }}>
          Other CRMs Available
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { name: 'Alto', status: 'Coming soon', icon: Database },
            { name: 'Street.co.uk', status: 'Coming soon', icon: Database },
            { name: 'Jupix', status: 'Coming soon', icon: Database },
          ].map((crm, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                border: '1px solid #E2E4EB',
                borderRadius: '16px',
                padding: '20px',
                opacity: 0.6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <Database size={20} color="#999999" />
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#999999', margin: '0' }}>
                  {crm.name}
                </h3>
              </div>
              <p style={{ fontSize: '12px', color: '#999999', margin: '0 0 12px 0' }}>
                {crm.status}
              </p>
              <button
                style={{
                  background: '#ffffff',
                  border: '1px solid #D9DCE4',
                  color: '#999999',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'not-allowed',
                  width: '100%',
                }}
              >
                Request Access
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#EDEEF2', fontFamily: 'Plus Jakarta Sans, system-ui, sans-serif' }}>
      {/* SIDEBAR */}
      <div
        style={{
          width: '240px',
          background: '#0F1117',
          color: '#ffffff',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #1C2128',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '800', margin: '0', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#D4764E' }}>Yalla</span>
            <span style={{ color: '#ffffff' }}>.House</span>
          </h1>
          <p style={{ fontSize: '11px', fontWeight: '600', color: '#999999', margin: '6px 0 0 0', textTransform: 'uppercase' }}>
            Agent Dashboard
          </p>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1 }}>
          {sidebarNavItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 12px',
                  marginBottom: '8px',
                  background: isActive ? 'rgba(212,118,78,.16)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: isActive ? '#D4764E' : '#999999',
                  fontSize: '13px',
                  fontWeight: isActive ? '600' : '500',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,.08)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#999999';
                  }
                }}
              >
                <IconComponent size={15} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      background: '#D4764E',
                      color: '#ffffff',
                      padding: '2px 6px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '700',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Agent Card */}
        <div
          style={{
            background: 'rgba(212,118,78,.12)',
            border: '1px solid rgba(212,118,78,.2)',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              background: '#D4764E',
              borderRadius: '50%',
              margin: '0 auto 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '700',
            }}
          >
            SM
          </div>
          <p style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff', margin: '0' }}>
            Sarah Mitchell
          </p>
          <p style={{ fontSize: '11px', color: '#999999', margin: '4px 0 0 0' }}>
            Foxtons
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'crm' && <CRMSyncTab />}

        {/* Fallback for other tabs */}
        {!['overview', 'analytics', 'crm'].includes(activeTab) && (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <p style={{ fontSize: '16px', color: '#999999', margin: '0' }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tab content coming soon
            </p>
          </div>
        )}
      </div>

      {/* TOAST NOTIFICATION */}
      {showToast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#D4764E',
            color: '#ffffff',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '500',
            boxShadow: '0 6px 20px rgba(0,0,0,.15)',
            animation: 'slideUp 0.2s ease',
          }}
        >
          {showToast}
          <style>{`@keyframes slideUp { from { transform: translateY(8px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
        </div>
      )}
    </div>
  );
}
