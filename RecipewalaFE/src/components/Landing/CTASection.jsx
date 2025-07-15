import { ArrowRight, Sparkles } from 'lucide-react'

const CTASection = ({ onGetStarted }) => {
  return (
    <section className="py-20 bg-gradient-to-r from-orange-500 to-yellow-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Cooking?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of home cooks who've already discovered the joy of AI-powered recipes. Start your culinary journey today!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="bg-white text-orange-500 px-8 py-4 rounded-xl hover:bg-gray-100 transition-colors font-semibold text-lg flex items-center space-x-2 shadow-lg"
            >
              <Sparkles className="h-5 w-5" />
              <span>Start Cooking Free</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <div className="text-orange-100 text-sm">
              ✓ No credit card required  ✓ 5 free recipes included
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection