// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight, Cpu, Brain, Eye, Factory, Rocket, Users, Laptop, Award, Clock, User } from 'lucide-react';

const Home = () => {
  const featuredCourses = [
    {
      id: 1,
      title: "Intel AI for Youth",
      category: "AI",
      duration: "6 months at 4 hours per week",
      level: "Beginner - Advanved",
      instructor: "Kobina Otchere",
      price: "Ghc 2,500",
      icon: Cpu
    },
    {
      id: 2,
      title: "Intel AI for Teachers",
      category: "AI",
      duration: "2 days at 4 hours per day",
      level: "Intermediate",
      instructor: "Emmanuella Mensah",
      price: "Ghc 250",
      icon: Brain
    },
    {
      id: 3,
      title: "Digital Income",
      category: "Tech Leverage",
      duration: "28h 45m",
      level: "Advanced",
      instructor: "Audrey-Bertha Nartey",
      price: "Ghc 1,500",
      icon: Factory
    }
  ];

  const features = [
    {
      icon: Rocket,
      title: "Cutting-Edge Content",
      description: "Our courses are constantly updated with the latest industry trends and technologies."
    },
    {
      icon: Users,
      title: "Expert Instructors",
      description: "Learn from industry professionals with years of real-world experience."
    },
    {
      icon: Laptop,
      title: "Learn Anywhere",
      description: "Access your courses on any device, online or offline."
    },
    {
      icon: Award,
      title: "Career Certificates",
      description: "Earn recognized certificates to boost your career prospects."
    }
  ];

  // Floating Card Component with CSS Animation
  const FloatingCard = ({ icon: Icon, title, description, style, delay = 0 }) => {
    return (
      <div
        className="glass-card floating-card"
        style={{
          padding: '20px',
          position: 'absolute',
          animationDelay: `${delay}s`,
          ...style
        }}
      >
        <div className="card-icon" style={{
          width: '50px',
          height: '50px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '15px',
          background: 'rgba(26, 82, 118, 0.1)',
          color: 'var(--primary)'
        }}>
          <Icon size={24} />
        </div>
        <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>{title}</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-light)' }}>{description}</p>
      </div>
    );
  };

  // Course Card with Hover Effects
  const CourseCard = ({ course, index }) => {
    return (
      <div
        className="glass-card course-card"
        style={{
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          animationDelay: `${index * 0.2}s`
        }}
      >
        <div style={{
          height: '180px',
          background: 'linear-gradient(135deg, var(--primary-light) 0%, var(--accent) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '60px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <course.icon size={48} />
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%)'
          }}></div>
        </div>
        <div style={{ padding: '20px' }}>
          <span style={{
            display: 'inline-block',
            padding: '5px 12px',
            background: 'rgba(26, 82, 118, 0.1)',
            color: 'var(--primary)',
            borderRadius: '50px',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '10px'
          }}>
            {course.category}
          </span>
          <h3 style={{ fontSize: '18px', marginBottom: '10px', lineHeight: '1.4' }}>{course.title}</h3>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: 'var(--text-light)',
            fontSize: '14px',
            marginBottom: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={14} />
              <span>{course.duration}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <User size={14} />
              <span>{course.level}</span>
            </div>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '15px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'var(--primary)'
              }}></div>
              <span style={{ fontSize: '14px' }}>{course.instructor}</span>
            </div>
            <div style={{
              fontWeight: '700',
              color: course.price === 'FREE' ? 'var(--accent)' : 'var(--primary)'
            }}>
              {course.price}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Feature Card with Animation
  const FeatureCard = ({ feature, index }) => {
    return (
      <div
        className="glass-card feature-card"
        style={{
          textAlign: 'center',
          padding: '30px 20px',
          borderRadius: '20px',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          animationDelay: `${index * 0.3}s`
        }}
      >
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          background: 'rgba(26, 82, 118, 0.1)',
          color: 'var(--primary)',
          fontSize: '28px'
        }}>
          <feature.icon size={28} />
        </div>
        <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>{feature.title}</h3>
        <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>{feature.description}</p>
      </div>
    );
  };

  return (
    <div>
      {/* Add CSS for animations */}


      {/* Hero Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '50px' }}>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '48px',
                lineHeight: '1.2',
                marginBottom: '20px',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Empowering Africa's Future with AI & Robotics
              </h1>
              <p style={{
                fontSize: '18px',
                color: 'var(--text-light)',
                marginBottom: '30px',
                lineHeight: '1.6'
              }}>
                Join Coral Reef Innovation Africa's premier training platform to master cutting-edge technologies.
                Develop skills in artificial intelligence, robotics, and automation tailored for African challenges and opportunities.
              </p>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                <Link to="/courses" className="btn btn-primary">
                  <Play size={18} />
                  Start Learning
                </Link>
                <button className="btn btn-secondary">
                  Explore Programs
                </button>
                <button className="btn btn-accent">
                  <Cpu size={18} />
                  AI Demo
                </button>
              </div>
            </div>

            <div style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              minHeight: '400px'
            }}>
              <div style={{
                position: 'relative',
                width: '100%',
                height: '400px'
              }}>
                <FloatingCard
                  icon={Cpu}
                  title="AI for Academic Research and Writing"
                  description="Conduct Academic Research with custom AI workflows and prompting"
                  style={{
                    width: '300px',
                    height: '200px',
                    top: 0,
                    left: 0,
                    '--rotation': '15deg'
                  }}
                  delay={0}
                />
                <FloatingCard
                  icon={Brain}
                  title="Intel AI for Youth"
                  description="Create intelligent algorithms and models"
                  style={{
                    width: '280px',
                    height: '180px',
                    top: '50px',
                    right: 0,
                    '--rotation': '3deg'
                  }}
                  delay={2}
                />
                <FloatingCard
                  icon={Eye}
                  title="Computer Vision"
                  description="Teach machines to see and interpret"
                  style={{
                    width: '250px',
                    height: '160px',
                    bottom: 0,
                    left: '30%',
                    '--rotation': '2deg'
                  }}
                  delay={4}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px'
          }}>
            <h2 style={{ fontSize: '32px', color: 'var(--text)' }}>Featured Courses</h2>
            <Link to="/courses" style={{
              color: 'var(--primary)',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              View All
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '30px'
          }}>
            {featuredCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="glass-card" style={{
            padding: '60px',
            margin: '40px 0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%)',
              pointerEvents: 'none'
            }}></div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '40px',
              position: 'relative',
              zIndex: 1
            }}>
              <h2 style={{ fontSize: '32px', color: 'var(--text)' }}>Why Learn With Us?</h2>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '30px',
              position: 'relative',
              zIndex: 1
            }}>
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  feature={feature}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;