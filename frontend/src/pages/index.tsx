import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Medical Dashboard XAI</h1>
          <p className="text-2xl text-gray-600">
            Explainable AI for Clinical Diagnostic Predictions
          </p>
          <p className="text-lg text-gray-500 mt-4">
            Using SHAP and LIME frameworks to interpret machine learning predictions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🔬</div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">Cardiovascular Diagnostics</h2>
            <p className="text-gray-600 mb-6">
              Predict cardiovascular disease risk with detailed SHAP and LIME explanations. Features include age, blood pressure, cholesterol levels, and more.
            </p>
            <Link href="/dashboard?model=cardiovascular">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">
                Analyze Patient →
              </button>
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🏥</div>
            <h2 className="text-2xl font-bold mb-3 text-gray-900">Kidney Disease Prediction</h2>
            <p className="text-gray-600 mb-6">
              Assess chronic kidney disease risk using clinical measurements. Get interpretable AI predictions with feature importance analysis.
            </p>
            <Link href="/dashboard?model=ckd">
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors">
                Analyze Patient →
              </button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-12 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-3">1</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Input Patient Data</h3>
              <p className="text-gray-600">Enter or use sample patient clinical measurements</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-3">2</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">ML Prediction</h3>
              <p className="text-gray-600">XGBoost model predicts disease risk with probability</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-3">3</div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Get Explanations</h3>
              <p className="text-gray-600">SHAP or LIME breaks down the exact prediction reasoning</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Analyze?</h2>
          <p className="text-lg mb-8">Start with the interactive dashboard to test predictions on sample data</p>
          <Link href="/dashboard">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-bold text-lg transition-colors">
              Open Dashboard →
            </button>
          </Link>
        </div>

        <div className="mt-16 text-center text-gray-600">
          <p className="text-sm">
            Academic Research Project • <a href="#" className="text-blue-600 hover:underline">GitHub</a> • 
            <a href="#" className="text-blue-600 hover:underline ml-2">Documentation</a>
          </p>
        </div>
      </div>
    </main>
  );
}

