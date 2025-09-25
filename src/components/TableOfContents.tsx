import { useEffect, useState } from 'react';

interface TableOfContentsProps {
  content: string;
}

interface TOCItem {
  id: string;
  title: string;
  level: number;
}

export const TableOfContents = ({ content }: TableOfContentsProps) => {
  const [tocItems, setTocItems] = useState<TOCItem[]>([]);

  useEffect(() => {
    // Parse HTML content to extract headings
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h2');
    
    const items: TOCItem[] = Array.from(headings).map((heading, index) => {
      const title = heading.textContent || '';
      const level = parseInt(heading.tagName.charAt(1));
      const id = `heading-${index}`;
      
      // Add ID to the heading for navigation
      heading.id = id;
      
      return {
        id,
        title: title.replace(/^(🚀|📊|💡|🔧|⚡|📱|🎯|💰|🌟|📈|🍽️|🔥|✨|🎨|📋|🔮|📈|👥|🏆|💳|🎭|🍕|🥗|🍰|📱|🛒|📞|🎪|🎪|🎪)?\s*/g, ''), // Remove emojis from TOC
        level
      };
    });
    
    setTocItems(items);
    
    // Update the DOM with IDs for smooth scrolling
    const articleElement = document.querySelector('.blog-content');
    if (articleElement) {
      const articleHeadings = articleElement.querySelectorAll('h2');
      articleHeadings.forEach((heading, index) => {
        heading.id = `heading-${index}`;
      });
    }
  }, [content]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start' 
      });
    }
  };

  if (tocItems.length === 0) {
    return (
      <p className="text-muted-foreground">
        Navega rápidamente por las secciones principales de este artículo.
      </p>
    );
  }

  return (
    <nav className="space-y-2">
      <p className="text-muted-foreground mb-3">
        Navega rápidamente por las secciones principales:
      </p>
      <ol className="space-y-2 list-decimal pl-4">
        {tocItems.map((item) => (
          <li key={item.id} className="text-sm pl-2">
            <button
              onClick={() => handleClick(item.id)}
              className="text-left text-muted-foreground hover:text-primary transition-colors leading-relaxed block w-full"
            >
              {item.title}
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
};