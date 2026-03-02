// src/pages/CourseCatalog.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, Cpu, Brain, Code, Wifi, Factory } from 'lucide-react';
import { FaClock, FaUser, FaStar, FaGraduationCap, FaHeart } from 'react-icons/fa';

const CourseCatalog = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [courses, setCourses] = useState([]);
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

    fetchCourses();
  }, []);

  const categories = [
    { id: 'all', name: 'All Courses', icon: Cpu },
    { id: 'ai', name: 'Artificial Intelligence', icon: Brain },
    { id: 'robotics', name: 'Robotics', icon: Cpu },
    { id: 'programming', name: 'Programming', icon: Code },
    { id: 'iot', name: 'Internet of Things', icon: Wifi },
    { id: 'automation', name: 'Industrial Automation', icon: Factory }
  ];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ fontSize: '36px', color: 'var(--primary)', marginBottom: '10px' }}>Course Catalog</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '18px' }}>
            Discover cutting-edge AI and robotics courses tailored for African innovation
          </p>
        </div>

        {/* Filters and Search */}
        <div className="glass-card" style={{ padding: '25px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Filter size={20} />
              <span style={{ fontWeight: '600' }}>Filter by:</span>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`btn ${selectedCategory === category.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '8px 16px' }}
                >
                  <category.icon size={16} />
                  {category.name}
                </button>
              ))}
            </div>

            <div className="search-bar" style={{ marginLeft: 'auto' }}>
              <Search size={18} className="icon" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading courses...</div>
        ) : (
          <div style={{ display: 'grid', gap: '30px' }}>
            {filteredCourses.map(course => (
              <div key={course._id || course.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex' }}>
                {/* Course Image */}
                <div style={{
                  width: '250px',
                  flexShrink: 0,
                  backgroundImage: `url(${course.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  position: 'relative'
                }}>
                  {/* Fallback if image doesn't load */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--accent) 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    opacity: 0,
                    transition: 'opacity 0.3s ease'
                  }} className="image-fallback">
                    Course Image
                  </div>
                </div>

                <div style={{ padding: '25px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(26, 82, 118, 0.1)', color: 'var(--primary)', borderRadius: '50px', fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>
                        {categories.find(cat => cat.id === course.category)?.name || course.category}
                      </span>
                      <h3 style={{ fontSize: '20px', marginBottom: '8px', color: 'var(--primary)' }}>{course.title}</h3>
                      <p style={{ color: 'var(--text-light)', lineHeight: '1.5', marginBottom: '15px' }}>{course.description}</p>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)', marginBottom: '5px' }}>
                        Ghc{course.price}
                      </div>
                      {course.originalPrice && (
                        <div style={{ fontSize: '14px', color: 'var(--text-light)', textDecoration: 'line-through' }}>
                          Ghc{course.originalPrice}
                        </div>
                      )}
                      {course.originalPrice && (
                        <div style={{ background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: '50px', fontSize: '12px', fontWeight: '600', marginTop: '5px' }}>
                          {Math.round((1 - course.price / course.originalPrice) * 100)}% OFF
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '20px', color: 'var(--text-light)', fontSize: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaClock size={14} />
                        <span>{course.modules?.reduce((acc, mod) => acc + mod.lessons.length, 0) || 0} Lessons</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaUser size={14} />
                        <span>{course.level}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaStar size={14} />
                        <span>{course.rating || 0} ({course.numStudents || 0} students)</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaGraduationCap size={14} />
                        <span>{course.instructor}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button className="btn btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaHeart size={14} />
                      </button>
                      <Link to={`/course/${course._id || course.id}`} className="btn btn-primary" style={{ padding: '8px 20px' }}>
                        View Course
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredCourses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-light)' }}>
            <Search size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
            <h3 style={{ marginBottom: '10px' }}>No courses found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCatalog;