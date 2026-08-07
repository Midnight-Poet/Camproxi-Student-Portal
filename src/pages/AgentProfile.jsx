import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  useGetAgentByIdQuery,
  useGetProductsQuery,
  useGetPropertiesQuery,
  useGetServicesQuery,
  useGetSchoolByIdQuery
} from '../store/apiSlice';
import { Icon } from '../components/Icon';
import { ListingCard } from '../components/ListingCard';
import { normalizeItem } from '../utils/normalizeItem';
import { AvatarCircle } from '../components/ui/AvatarCircle';

export function AgentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: agentRes, isLoading: isLoadingAgent } = useGetAgentByIdQuery(id, { skip: !id });
  const agent = agentRes?.data || agentRes;

  const schoolName = agent?.school?.campus?.[0]?.name || agent?.school?.code || agent?.school?.name || agent?.campus || agent?.campusName;


  // Fetch all items to filter for this agent
  const { data: productsRes, isLoading: isLoadingProducts } = useGetProductsQuery();
  const { data: propertiesRes, isLoading: isLoadingProperties } = useGetPropertiesQuery();
  const { data: servicesRes, isLoading: isLoadingServices } = useGetServicesQuery();

  const isLoadingItems = isLoadingProducts || isLoadingProperties || isLoadingServices;

  // Combine and normalize items
  const products = Array.isArray(productsRes) ? productsRes : (productsRes?.data || []);
  const properties = Array.isArray(propertiesRes) ? propertiesRes : (propertiesRes?.data || []);
  const services = Array.isArray(servicesRes) ? servicesRes : (servicesRes?.data || []);

  const allItems = [
    ...properties.map(item => normalizeItem(item, 'PROPERTY')),
    ...products.map(item => normalizeItem(item, 'PRODUCT')),
    ...services.map(item => normalizeItem(item, 'SERVICE'))
  ];

  // Filter items for this agent
  const agentItems = allItems.filter(item => item.agentId === id || item.agent?.id === id || item.agent?._id === id);

  if (isLoadingAgent) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pb-20">
        <div className="w-10 h-10 border-4 border-cx-border border-t-cx-teal rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center pb-20 px-4">
        <Icon name="person_off" size={64} className="text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Agent not found</h2>
        <p className="text-slate-500 mb-6 text-center">This profile doesn't exist or has been removed.</p>
        <button 
          onClick={() => navigate(-1)}
          className="bg-cx-teal text-white px-6 py-2.5 rounded-full font-bold hover:bg-teal-600 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const agentName = `${agent.firstName || ''} ${agent.lastName || ''}`.trim() || 'Verified Agent';
  const companyName = agent.companyName || agent.businessName || 'Verified Provider';
  const memberSince = agent.createdAt ? new Date(agent.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'Recently';

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-12 overflow-y-auto">
      {/* Header / Cover */}
      <div className="h-32 md:h-48 bg-gradient-to-r from-cx-teal to-teal-700 relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-white transition-colors border-none cursor-pointer"
        >
          <Icon name="arrow_back" size={24} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {/* Profile Info */}
        <div className="relative -mt-16 md:-mt-20 mb-8 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 md:items-end">
          <div className="relative flex-none">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden bg-slate-100 shadow-md">
              <AvatarCircle name={agentName} size={160} imageUrl={agent.profileImage?.url || agent.avatar} />
            </div>
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-cx-teal rounded-full border-2 border-white flex items-center justify-center shadow-sm">
              <Icon name="verified" size={16} className="text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">{agentName}</h1>
            {agent?.username && (
              <p className="text-slate-500 font-medium text-sm md:text-base mt-0.5">
                @{agent.username}
              </p>
            )}
            <p className="text-cx-teal font-bold text-base md:text-lg mt-1">{companyName}</p>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-500">
              <div className="flex items-center gap-1.5">
                <Icon name="calendar_today" size={18} />
                <span>Joined {memberSince}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="storefront" size={18} />
                <span>{agentItems.length} {agentItems.length === 1 ? 'Listing' : 'Listings'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="verified" size={18} className="text-cx-teal" />
                <span className="font-semibold text-cx-teal">Verified Account</span>
              </div>
              {schoolName && (
                <div className="flex items-center gap-1.5">
                  <Icon name="school" size={18} />
                  <span className="capitalize">{schoolName}</span>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bio */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-3">About</h3>
          <p className="text-slate-600 leading-relaxed whitespace-pre-line">
            {agent.bio || 'This agent has not provided a bio yet.'}
          </p>
        </div>

        {/* Listings */}
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            Listings <span className="bg-slate-200 text-slate-600 text-sm py-0.5 px-2.5 rounded-full">{agentItems.length}</span>
          </h2>
          
          {isLoadingItems ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white border border-slate-100 rounded-3xl p-4 animate-pulse shadow-sm h-72"></div>
              ))}
            </div>
          ) : agentItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {agentItems.map(item => (
                <ListingCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-100">
              <Icon name="inventory_2" size={48} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">No listings found</h3>
              <p className="text-slate-500">This agent hasn't posted any items yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
