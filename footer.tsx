import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4" data-testid="footer-title">RelationshipWise</h3>
            <p className="text-slate-300 mb-4">
              Empowering people to build healthier, more meaningful relationships through AI-powered education and practice.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-slate-400 hover:text-white" data-testid="social-twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white" data-testid="social-facebook">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-slate-400 hover:text-white" data-testid="social-instagram">
                <i className="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Learn</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#" className="hover:text-white" data-testid="footer-communication">Communication Skills</a></li>
              <li><a href="#" className="hover:text-white" data-testid="footer-emotional">Emotional Intelligence</a></li>
              <li><a href="#" className="hover:text-white" data-testid="footer-social">Social Cues</a></li>
              <li><a href="#" className="hover:text-white" data-testid="footer-conflict">Conflict Resolution</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-slate-300">
              <li><a href="#" className="hover:text-white" data-testid="footer-help">Help Center</a></li>
              <li><a href="#" className="hover:text-white" data-testid="footer-contact">Contact Us</a></li>
              <li><a href="#" className="hover:text-white" data-testid="footer-community">Community</a></li>
              <li><a href="#" className="hover:text-white" data-testid="footer-privacy">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Stay Updated</h4>
            <p className="text-slate-300 mb-4">
              Get the latest tips and resources for building better relationships.
            </p>
            <div className="flex">
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-slate-800 border-slate-700 text-white"
                data-testid="newsletter-email"
              />
              <Button className="bg-primary hover:bg-blue-700 ml-2" data-testid="newsletter-subscribe">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; 2024 RelationshipWise. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
