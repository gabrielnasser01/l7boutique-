import { HeroSection } from '@/components/home/hero-section';
import { CategoriesSection } from '@/components/home/categories-section';
import { FeaturedSection } from '@/components/home/featured-section';
import { NewArrivalsSection } from '@/components/home/new-arrivals-section';
import { SneakersSection } from '@/components/home/sneakers-section';
import { CollectionsBanner } from '@/components/home/collections-banner';
import { TestimonialsSection } from '@/components/home/testimonials-section';
import { FaqSection } from '@/components/home/faq-section';

export default function Home() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <FeaturedSection />
      <NewArrivalsSection />
      <SneakersSection />
      <CollectionsBanner />
      <TestimonialsSection />
      <FaqSection />
    </>
  );
}
