import React, { useState, useEffect } from 'react';
import styles from '../styles/News.module.css'; // Using a separate CSS module

const FINNHUB_API_KEY = 'cvtcg9hr01qhup0vkq3gcvtcg9hr01qhup0vkq40'; // Replace with your actual API key

const News = () => {
  // State for news data and filtering
  const [newsData, setNewsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [featuredNews, setFeaturedNews] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 6;

  // Time filters for recency
  const timeFilters = [
    { id: 'all', name: 'All Time' },
    { id: 'today', name: 'Today' },
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' }
  ];

  const [activeTimeFilter, setActiveTimeFilter] = useState('all');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `https://finnhub.io/api/v1/news?category=general&token=${FINNHUB_API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }

        const data = await response.json();
        
        // Transform Finnhub data to match our UI structure
        const transformedNews = data.map((item, index) => ({
          id: index,
          title: item.headline,
          date: new Date(item.datetime * 1000).toLocaleDateString(),
          source: item.source,
          image: item.image || '/api/placeholder/800/450',
          snippet: item.summary,
          url: item.url,
          featured: index === 0, // First news item is featured
          relatedAssets: item.related || []
        }));

        setNewsData(transformedNews);
        setFeaturedNews(transformedNews[0]);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNewsData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  // Filter news based on search query
  const filteredNews = newsData.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          news.snippet.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const indexOfLastNews = currentPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const currentNews = filteredNews.slice(indexOfFirstNews, indexOfLastNews);
  const totalPages = Math.ceil(filteredNews.length / newsPerPage);

  // Page change handler
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return <div className={styles.loadingContainer}>Loading latest stock news...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1>Stock Market News</h1>
        <p>Stay up to date with the latest developments in the stock market</p>
      </div>

      {/* Search bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search stock news..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className={styles.searchButton}>
          <span className={styles.searchIcon}>🔍</span>
        </button>
      </div>

      {/* Time filters */}
      <div className={styles.filtersContainer}>
        <div className={styles.timeFilters}>
          {timeFilters.map(filter => (
            <button 
              key={filter.id}
              className={`${styles.filterBtn} ${styles.timeFilter} ${activeTimeFilter === filter.id ? styles.active : ''}`}
              onClick={() => setActiveTimeFilter(filter.id)}
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {/* Featured news section */}
      {featuredNews && (
        <div className={styles.featuredNews}>
          <div className={styles.featuredContent}>
            <span className={styles.featuredLabel}>Featured Stock Story</span>
            <h2>{featuredNews.title}</h2>
            <p className={styles.newsMeta}>{featuredNews.source} • {featuredNews.date}</p>
            <p className={styles.newsSnippet}>{featuredNews.snippet}</p>
            <div className={styles.relatedAssets}>
              {featuredNews.relatedAssets.map(asset => (
                <span key={asset} className={styles.assetTag}>{asset}</span>
              ))}
            </div>
            <a href={featuredNews.url} className={styles.readMoreBtn}>Read Full Story</a>
          </div>
          <div className={styles.featuredImage}>
            <img src={featuredNews.image} alt={featuredNews.title} />
          </div>
        </div>
      )}

      {/* News grid */}
      <div className={styles.newsGrid}>
        {currentNews.length > 0 ? (
          currentNews.map(news => (
            <div key={news.id} className={styles.newsCard}>
              <div className={styles.newsImageContainer}>
                <img src={news.image} alt={news.title} className={styles.newsImage} />
                <span className={styles.categoryBadge}>Stocks</span>
              </div>
              <div className={styles.newsContent}>
                <h3>{news.title}</h3>
                <p className={styles.newsMeta}>{news.source} • {news.date}</p>
                <p className={styles.newsSnippet}>{news.snippet}</p>
                <div className={styles.newsFooter}>
                  <div className={styles.relatedAssets}>
                    {news.relatedAssets.map(asset => (
                      <span key={asset} className={styles.assetTag}>{asset}</span>
                    ))}
                  </div>
                  <a href={news.url} className={styles.readMore}>Read more →</a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noResults}>
            <p>No stock news found matching your criteria. Try adjusting your search.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredNews.length > newsPerPage && (
        <div className={styles.pagination}>
          <button 
            className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ''}`}
            onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
            <button
              key={number}
              className={`${styles.pageBtn} ${currentPage === number ? styles.activePage : ''}`}
              onClick={() => handlePageChange(number)}
            >
              {number}
            </button>
          ))}
          
          <button
            className={`${styles.pageBtn} ${currentPage === totalPages ? styles.disabled : ''}`}
            onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Newsletter subscription */}
      <div className={styles.newsletterContainer}>
        <div className={styles.newsletterContent}>
          <h2>Stay Ahead of the Stock Market</h2>
          <p>Subscribe to our newsletter and receive daily stock market updates directly to your inbox.</p>
          <div className={styles.subscribeForm}>
            <input type="email" placeholder="Your email address" className={styles.emailInput} />
            <button className={styles.subscribeBtn}>Subscribe</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;