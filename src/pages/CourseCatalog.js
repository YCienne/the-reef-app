// src/pages/CourseCatalog.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, Cpu, Brain, Code, Wifi, Factory } from 'lucide-react';
import { FaClock, FaUser, FaStar, FaGraduationCap, FaHeart, FaUsers } from 'react-icons/fa';

const CourseCatalog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
  const [enrollmentCounts, setEnrollmentCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/courses`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`HTTP error! status: ${response.status}, body: ${errorText.substring(0, 200)}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          console.error('API returned invalid data format:', data);
          setCourses([]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchEnrollmentCounts = async () => {
      try {
        const apiUrl = `${process.env.REACT_APP_API_URL || ''}/api/courses/enrollment-counts`;
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          setEnrollmentCounts(data);
        }
      } catch (error) {
        console.error('Error fetching enrollment counts:', error);
      }
    };

    fetchCourses();
    fetchEnrollmentCounts();
  }, []);

  const allCategories = [
    { id: 'all', name: 'All Courses', icon: Cpu },
    { id: 'ai', name: 'Artificial Intelligence', icon: Brain },
    { id: 'robotics', name: 'Robotics', icon: Cpu },
    { id: 'programming', name: 'Programming', icon: Code },
    { id: 'iot', name: 'Internet of Things', icon: Wifi },
    { id: 'automation', name: 'Industrial Automation', icon: Factory }
  ];

  // Only show filters that have at least one matching course (besides "All")
  const categories = allCategories.filter(
    category => category.id === 'all' || courses.some(c => c.category === category.id)
  );

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="catalog-page">
      <div className="container">
        {/* Header */}
        <div className="catalog-heading">
          <h1 className="catalog-title">Programmes</h1>
          <p className="catalog-subtitle">
            Discover cutting-edge AI and robotics courses tailored for African innovation
          </p>
        </div>

        {/* Filters and Search */}
        <div className="glass-card catalog-filters">
          <div className="filter-row">
            <div className="filter-label">
              <Filter size={18} />
              <span>Filter by:</span>
            </div>

            {/* Horizontally scrollable category pills */}
            <div className="category-scroll">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`btn category-pill ${selectedCategory === category.id ? 'btn-primary' : 'btn-secondary'}`}
                >
                  <category.icon size={14} />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

            {/* Desktop-only search inside filter row */}
            <div className="search-bar catalog-search-desktop">
              <Search size={18} className="icon" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Mobile search bar (full-width row below) */}
          <div className="catalog-search-mobile">
            <Search size={16} className="icon" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div className="catalog-loading">
            <div className="catalog-loading-spinner" />
            <p>Loading courses...</p>
          </div>
        ) : (
          <div className="course-list">
            {filteredCourses.map(course => {
              const courseId = course._id || course.id;
              const learnerCount = enrollmentCounts[courseId] || 0;
              return (
                <div key={courseId} className="glass-card course-card-item">
                  {/* Course Image */}
                  <div
                    className="course-card-image"
                    style={{
                      backgroundImage: `url(${course.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    {/* Category badge overlay on image */}
                    <span className="course-image-badge">
                      {categories.find(cat => cat.id === course.category)?.name || course.category}
                    </span>
                  </div>

                  {/* Course Content */}
                  <div className="course-card-body">
                    {/* Title row + price */}
                    <div className="course-card-top">
                      <div className="course-card-meta">
                        <span className="learners-badge">
                          <FaUsers size={10} />
                          {learnerCount} {learnerCount === 1 ? 'learner' : 'learners'} enrolled
                        </span>
                        <h3 className="course-card-title">{course.title}</h3>
                        <p className="course-card-desc">{course.description}</p>
                      </div>

                      <div className="course-card-price">
                        <div className="price-main">Ghc{course.price}</div>
                        {course.originalPrice && (
                          <div className="price-original">Ghc{course.originalPrice}</div>
                        )}
                        {course.originalPrice && (
                          <div className="price-badge">
                            {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats + Actions row */}
                    <div className="course-card-footer">
                      <div className="course-stats">
                        <span className="course-stat">
                          <FaClock size={12} />
                          {course.modules?.reduce((acc, mod) => acc + mod.lessons.length, 0) || 0} Lessons
                        </span>
                        <span className="course-stat">
                          <FaUser size={12} />
                          {course.level}
                        </span>
                        <span className="course-stat">
                          <FaStar size={12} />
                          {course.rating || 0}
                        </span>
                        <span className="course-stat course-stat-instructor">
                          <FaGraduationCap size={12} />
                          {course.instructor}
                        </span>
                      </div>

                      <div className="course-card-actions">
                        <button className="btn btn-secondary icon-only-btn" aria-label="Save course">
                          <FaHeart size={14} />
                        </button>
                        <Link to={`/course/${courseId}`} className="btn btn-primary view-course-btn">
                          View Course
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div className="catalog-empty">
            <Search size={48} style={{ marginBottom: '20px', opacity: 0.4 }} />
            <h3>No courses found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;
