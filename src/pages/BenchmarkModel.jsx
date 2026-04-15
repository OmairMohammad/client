import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

import { api } from '../lib/api';

export default function BenchmarkModel() {
  const { currentUser } = useAuth();
  const [benchmark, setBenchmark] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.getModelBenchmark().then(data => mounted && setBenchmark(data));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slatebg">
      <Navbar user={currentUser} />
      <div className="grid min-h-[calc(100vh-89px)] lg:grid-cols-[260px_1fr]">
        <Sidebar user={currentUser} />
        <main className="p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Benchmark Models</h2>
            <p className="mt-1 text-sm text-slate-500">Offline model benchmarking aligned with the backend dataset and explainable production decision engine.</p>
          </div>

          {!benchmark ? <div className="card p-6 text-sm text-slate-500">Loading benchmark summary…</div> : (
            <>
              <section className="grid gap-4 md:grid-cols-4">
                <div className="card p-5"><p className="text-sm font-semibold text-slate-900">Dataset Size</p><p className="mt-3 text-3xl font-bold text-brand-600">{benchmark.dataset.assets}</p></div>
                <div className="card p-5"><p className="text-sm font-semibold text-slate-900">Random Forest Accuracy</p><p className="mt-3 text-3xl font-bold text-brand-600">{Math.round((benchmark.randomForest.accuracy || 0) * 100)}%</p></div>
                <div className="card p-5"><p className="text-sm font-semibold text-slate-900">XGBoost Accuracy</p><p className="mt-3 text-3xl font-bold text-brand-600">{Math.round((benchmark.xgboost.accuracy || 0) * 100)}%</p></div>
                <div className="card p-5"><p className="text-sm font-semibold text-slate-900">Estimated Outliers</p><p className="mt-3 text-3xl font-bold text-brand-600">{benchmark.isolationForest.estimatedOutliers}</p></div>
              </section>

              <section className="grid gap-6 xl:grid-cols-2">
                <div className="card p-5">
                  <h3 className="card-title">Random Forest Top Features</h3>
                  <div className="mt-4 space-y-3">
                    {benchmark.randomForest.topFeatures.map(item => (
                      <div key={item.feature} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-900">{item.feature}</p>
                          <p className="text-sm font-bold text-brand-600">{item.importance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card p-5">
                  <h3 className="card-title">XGBoost Top Features</h3>
                  <div className="mt-4 space-y-3">
                    {(benchmark.xgboost.topFeatures || []).map(item => (
                      <div key={item.feature} className="rounded-xl border border-slate-200 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-900">{item.feature}</p>
                          <p className="text-sm font-bold text-brand-600">{item.importance}</p>
                        </div>
                      </div>
                    ))}
                    {benchmark.xgboost.note && <p className="text-sm text-slate-500">{benchmark.xgboost.note}</p>}
                  </div>
                </div>
              </section>

              <section className="card p-5">
                <h3 className="card-title">Model Positioning</h3>
                <p className="mt-3 text-sm text-slate-600">Production decision engine: <strong>{benchmark.positioning.productionDecisionEngine}</strong></p>
                <p className="mt-2 text-sm text-slate-600">Offline benchmarks: {(benchmark.positioning.offlineBenchmarks || []).join(', ')}</p>
                <p className="mt-2 text-sm text-slate-600">{benchmark.positioning.why}</p>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
