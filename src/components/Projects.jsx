import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiGithub, FiExternalLink, FiLoader } from 'react-icons/fi';
import { projectsAPI } from '../services/api';

const FALLBACK_PROJECTS = [
  {
    id: 1,
    title: 'Sample Game Project',
    description: 'A 2D platformer built with Unity featuring pixel art graphics and challenging gameplay mechanics.',
    thumbnail: null,
    tags: ['Unity', 'C#', 'Game Dev'],
    links: [{ type: 'github', url: 'https://github.com/rillToMe' }],
  },
];

const TagBadge = ({ tag }) => (
  <span className="px-2 py-0.5 font-mono text-xs text-pixel-blue/70 border border-pixel-blue/20 bg-pixel-blue/5"
    style={{ clipPath: 'polygon(3px 0%, 100% 0%, calc(100% - 3px) 100%, 0% 100%)' }}>
    {tag}
  </span>
);

const ProjectCard = ({ project, index }) => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
      className="group relative border border-pixel-blue/15 bg-bg-card/40 hover:border-pixel-blue/40 hover:bg-bg-hover/50 transition-all duration-300 overflow-hidden"
      style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
    >
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden bg-bg-primary border-b border-pixel-blue/10">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid-overlay flex items-center justify-center">
            <div className="text-center">
              <div className="font-pixel text-pixel-blue/20 text-3xl mb-2">◈</div>
              <p className="font-mono text-pixel-gray/30 text-xs">NO PREVIEW</p>
            </div>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-pixel-blue/0 group-hover:bg-pixel-blue/5 transition-all duration-300" />
        <div className="absolute top-3 left-3 px-2 py-1 bg-bg-primary/80 border border-pixel-blue/30 font-pixel text-pixel-blue/60 text-[8px]">
          #{String(index + 1).padStart(2, '0')}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-sans font-bold text-lg text-pixel-white mb-2 group-hover:text-pixel-blue transition-colors line-clamp-1">
          {project.title}
        </h3>
        <p className="font-sans text-pixel-gray/70 text-sm leading-relaxed mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.tags.slice(0, 4).map(tag => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}

        {/* Links */}
        {project.links && project.links.length > 0 && (
          <div className="flex items-center gap-3 pt-3 border-t border-pixel-blue/10">
            {project.links.map(link => (
              <a
                key={link.type}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs text-pixel-gray hover:text-pixel-blue transition-colors group/link"
              >
                {link.type === 'github' ? (
                  <FiGithub className="text-sm group-hover/link:scale-110 transition-transform" />
                ) : (
                  <FiExternalLink className="text-sm group-hover/link:scale-110 transition-transform" />
                )}
                <span className="capitalize">{link.type === 'github' ? 'Source' : 'Live Demo'}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-pixel-blue/30 group-hover:border-pixel-blue/60 transition-colors" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-pixel-blue/15 group-hover:border-pixel-blue/40 transition-colors" />
    </motion.div>
  );
};

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectsAPI.getAll();
        setProjects(res.data?.data || FALLBACK_PROJECTS);
      } catch {
        setProjects(FALLBACK_PROJECTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <section id="projects" className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-50 pointer-events-none" />

      <div ref={ref} className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="section-tag mb-3">// 02. projects</p>
          <div className="flex items-end gap-4 flex-wrap">
            <h2 className="font-sans font-bold text-4xl md:text-5xl text-pixel-white">
              My <span className="gradient-text">Creations</span>
            </h2>
            <span className="font-mono text-pixel-gray/40 text-sm mb-1">
              [{projects.length} quests completed]
            </span>
          </div>
          <div className="section-divider max-w-xs mt-4" />
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <FiLoader className="text-pixel-blue text-2xl animate-spin mr-3" />
            <span className="font-mono text-pixel-gray text-sm">Loading projects...</span>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 border border-pixel-blue/10">
            <p className="font-pixel text-pixel-gray/30 text-xs">NO PROJECTS FOUND</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}

        {/* View all on GitHub */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-12 flex justify-center"
        >
          <a
            href="https://github.com/rillToMe"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-pixel inline-flex items-center gap-2 text-sm"
          >
            <FiGithub />
            View All on GitHub
          </a>
        </motion.div>
      </div>
    </section>
  );
}
