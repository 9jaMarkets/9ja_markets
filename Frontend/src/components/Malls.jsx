import { useState, useContext, useMemo, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import debounce from "lodash.debounce";
import {
  Store,
  ShoppingBag,
  MapPin,
  SlidersHorizontal,
  X,
  ShoppingCart,
  SearchX,
  Search,
} from "lucide-react";
import { STATES } from "../config";
import { MALLS_DATA_CONTEXT } from "@/contexts";
import SkeletonCard from "./shared/SkeletonCard";

const MallPage = () => {
  const [selectedState, setSelectedState] = useState(STATES[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const { mallsData } = useContext(MALLS_DATA_CONTEXT);

  // Set up debounced search term
  const debouncedSearch = useCallback(
    debounce((value) => {
      setDebouncedSearchTerm(value);
    }, 300),
    []
  );

  // Update debounced value when search term changes
  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  // Handle data loading state
  useEffect(() => {
    if (mallsData && mallsData.length > 0) {
      // Only mark as loaded if we actually have data
      setDataLoaded(true);
    }
  }, [mallsData]);

  // Reset loading state when state changes
  useEffect(() => {
    setDataLoaded(false);
    // Add a small delay to prevent flickering if data loads very quickly
    const timer = setTimeout(() => {
      if (mallsData && mallsData.length > 0) {
        setDataLoaded(true);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedState]);

  const filteredMalls = useMemo(() => {
    if (!selectedState) return mallsData;

    // First filter by state
    const stateFiltered = mallsData.filter((mall) => {
      if (!mall.state) return false;
      return mall.state.toLowerCase().includes(selectedState.toLowerCase());
    });

    // If no search term, return state-filtered malls
    if (!debouncedSearchTerm) return stateFiltered;

    const searchLower = debouncedSearchTerm.toLowerCase();

    // Create arrays for different priority levels
    const nameMatches = [];
    const descriptionMatches = [];
    const addressMatches = [];
    const otherMatches = [];

    mallsData.forEach((mall) => {
      // Check mall name (highest priority)
      if (mall.name.toLowerCase().includes(searchLower)) {
        nameMatches.push({ ...mall, relevanceScore: 4 });
      }
      // Check description (second priority)
      else if (
        mall.description &&
        mall.description.toLowerCase().includes(searchLower)
      ) {
        descriptionMatches.push({ ...mall, relevanceScore: 3 });
      }
      // Check address (third priority)
      else if (mall.address.toLowerCase().includes(searchLower)) {
        addressMatches.push({ ...mall, relevanceScore: 2 });
      }
      // Check other fields
      else if (mall.state.toLowerCase().includes(searchLower)) {
        otherMatches.push({ ...mall, relevanceScore: 1 });
      }
    });

    // Combine all matches in priority order
    return [
      ...nameMatches,
      ...descriptionMatches,
      ...addressMatches,
      ...otherMatches,
    ];
  }, [selectedState, mallsData, debouncedSearchTerm]);

  return (
    <div className="z-0 relative flex flex-col bg-gray-50 min-h-screen">
      {/* Header Navigation - Updated positioning */}
      <div className="top-[55px] z-20 sticky bg-white shadow-sm">
        {/* Removed container class to allow full-width alignment */}
        <div className="flex items-center h-16">
          {/* Market/Mall Switch - Aligned exactly with sidebar */}
          <div className="hidden md:flex items-center space-x-6 pl-6 w-72 lg:w-80">
            <Link
              to="/markets"
              className="flex items-center gap-2 text-gray-600 hover:text-Primary text-lg transition-colors"
            >
              <Store className="w-5 h-5" />
              <span>Markets</span>
            </Link>
            <Link
              to="/malls"
              className="flex items-center gap-2 hover:opacity-90 font-bold text-Primary text-lg transition-opacity"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Malls</span>
            </Link>
          </div>

          {/* Mobile Market/Mall Switch */}
          <div className="md:hidden flex items-center space-x-4 px-4">
            <Link
              to="/markets"
              className="flex items-center gap-1 text-gray-600 hover:text-Primary transition-colors"
            >
              <Store className="w-5 h-5" />
            </Link>
            <Link
              to="/malls"
              className="flex items-center gap-1 hover:opacity-90 font-bold text-Primary transition-opacity"
            >
              <ShoppingBag className="w-5 h-5" />
            </Link>
          </div>

          {/* Search Bar - Centered in remaining space */}
          <div className="flex flex-1 justify-center px-4">
            <div className="w-full max-w-xl">
              <div className="group relative">
                <input
                  type="text"
                  placeholder={`Search ${selectedState} malls...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/90 shadow-sm hover:shadow px-4 py-2 pr-16 pl-12 border-2 border-Primary/80 focus:border-Primary rounded-full focus:outline-none focus:ring-2 focus:ring-Primary/20 w-full text-sm transition-all"
                />
                {/* Search icon on the left */}
                <div className="top-1/2 left-4 absolute text-Primary -translate-y-1/2">
                  <Search size={18} />
                </div>

                {/* Clear button - only shows when there's text */}
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="top-1/2 right-4 absolute hover:bg-gray-100 p-1 rounded-full text-gray-400 hover:text-gray-600 transition-all -translate-y-1/2"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}

                {/* State indicator on the right
                <div className="top-1/2 right-3 absolute bg-Primary/10 px-2 py-1 rounded-full font-medium text-Primary text-xs -translate-y-1/2">
                  {selectedState}
                </div> */}
              </div>
            </div>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(true)}
            className="md:hidden flex justify-center items-center mr-4 rounded-full w-10 h-10 text-Primary"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <div
        className={`fixed inset-0 bg-black/50 z-[21] transition-opacity duration-300 md:hidden ${
          showFilters ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setShowFilters(false)}
      />

      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-white z-[22] transform transition-transform duration-300 ease-in-out md:hidden ${
          showFilters ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold text-lg">Select State</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="hover:bg-gray-100 p-2 rounded-full"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="gap-2 grid grid-cols-2 p-4">
              {STATES.map((state) => (
                <button
                  key={state}
                  onClick={() => {
                    setSelectedState(state);
                    setShowFilters(false);
                  }}
                  className={`p-3 text-left rounded-lg transition-all ${
                    selectedState === state
                      ? "bg-Primary text-white font-medium"
                      : "text-gray-700 hover:bg-Primary/10"
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside
          className="hidden md:block bg-white p-6 w-72 lg:w-80 overflow-y-auto"
          style={{
            position: "sticky",
            top: "119px", // 55px (Header2) + 64px (Market nav)
            height: "calc(100vh - 119px)", // Viewport - (Header2 + Market nav)
          }}
        >
          <h3 className="mb-4 font-semibold text-lg">Select State</h3>
          <div className="gap-2 grid">
            {STATES.map((state) => (
              <button
                key={state}
                onClick={() => setSelectedState(state)}
                className={`p-3 text-left rounded-lg transition-all ${
                  selectedState === state
                    ? "bg-Primary text-white font-medium"
                    : "text-gray-700 hover:bg-Primary/10"
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </aside>

        {/* Malls Grid */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto container">
            <h2 className="mb-6 font-bold text-gray-800 text-xl md:text-2xl">
              {selectedState} State Malls
            </h2>

            <div className="gap-3 md:gap-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {!dataLoaded ? (
                // Show skeleton cards while loading
                Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              ) : filteredMalls.length > 0 ? (
                filteredMalls.map((mall, index) => (
                  <Link
                    to={`/malls/${mall.id}`}
                    key={mall.id || index}
                    className="group relative bg-white shadow-sm hover:shadow-md rounded-xl overflow-hidden transition-all duration-300"
                  >
                    <div className="relative">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={mall.displayImage}
                          alt={mall.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 transform"
                        />
                      </div>
                      {/* State Badge */}
                      <span className="top-3 right-3 absolute bg-white/90 shadow-sm px-3 py-1 rounded-full font-medium text-gray-700 text-sm">
                        {mall.state}
                      </span>
                      {/* Description Overlay */}
                      <div className="absolute inset-0 flex justify-center items-center bg-black/70 opacity-0 group-hover:opacity-100 p-4 transition-opacity duration-200">
                        <p className="text-white text-sm text-center line-clamp-4">
                          {mall.description || "No description available"}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 md:p-4">
                      <h3 className="group-hover:text-Primary font-semibold text-gray-800 text-sm md:text-lg line-clamp-1 transition-colors">
                        {mall.name}
                      </h3>
                      <div className="flex items-start gap-2 mt-2 text-gray-600">
                        <MapPin size={16} className="flex-shrink-0 mt-1" />
                        <p className="text-xs md:text-sm line-clamp-2">
                          {mall.address}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col justify-center items-center col-span-full px-4 py-12">
                  <div className="relative mb-6">
                    <ShoppingCart className="w-24 h-24 text-gray-200 animate-bounce" />
                    <SearchX className="-right-2 -bottom-2 absolute w-12 h-12 text-orange -rotate-12 transform" />
                  </div>
                  <div className="space-y-3 mx-auto max-w-md text-center">
                    <h3 className="font-semibold text-gray-800 text-xl">
                      Shopping Malls Not Found
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm ? (
                        <>
                          We couldn't find any shopping malls matching "
                          {searchTerm}" in {selectedState}. Try a different
                          search term or browse malls in another state.
                        </>
                      ) : (
                        <>
                          Looks like we haven't mapped any malls in{" "}
                          {selectedState} yet. Don't worry - we're constantly
                          adding new locations!
                        </>
                      )}
                    </p>
                    <div className="flex sm:flex-row flex-col justify-center gap-3 pt-6">
                      <button
                        onClick={() => setSearchTerm("")}
                        className="hover:bg-Primary/5 px-4 py-2 border-2 border-Primary rounded-full w-full sm:w-auto text-Primary text-sm transition-colors"
                      >
                        Reset Search
                      </button>
                      <Link
                        to="/markets"
                        className="flex justify-center items-center gap-2 bg-Primary hover:bg-Primary/90 px-4 py-2 rounded-full w-full sm:w-auto text-white text-sm whitespace-nowrap transition-colors"
                      >
                        <Store className="w-4 h-4" />
                        Try Markets Instead
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MallPage;
