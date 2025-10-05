import numpy as np
from sklearn.ensemble import IsolationForest
from typing import List, Dict, Tuple
from datetime import datetime, timedelta

class AnomalyDetector:
    def __init__(self, contamination: float = 0.1, random_state: int = 42):
        self.contamination = contamination
        self.random_state = random_state
        self.models: Dict[str, IsolationForest] = {}
        self.training_data: Dict[str, List[float]] = {}
        self.trained: Dict[str, bool] = {}

    def get_model_key(self, service_name: str, metric_type: str) -> str:
        return f"{service_name}:{metric_type}"

    def add_training_data(self, service_name: str, metric_type: str, value: float):
        key = self.get_model_key(service_name, metric_type)

        if key not in self.training_data:
            self.training_data[key] = []

        self.training_data[key].append(value)

        if len(self.training_data[key]) > 1000:
            self.training_data[key] = self.training_data[key][-1000:]

    def train_model(self, service_name: str, metric_type: str) -> bool:
        key = self.get_model_key(service_name, metric_type)

        if key not in self.training_data or len(self.training_data[key]) < 20:
            return False

        X = np.array(self.training_data[key]).reshape(-1, 1)

        model = IsolationForest(
            contamination=self.contamination,
            random_state=self.random_state,
            n_estimators=100
        )
        model.fit(X)

        self.models[key] = model
        self.trained[key] = True

        return True

    def detect_anomaly(
        self,
        service_name: str,
        metric_type: str,
        value: float
    ) -> Tuple[bool, float, float, float]:
        key = self.get_model_key(service_name, metric_type)

        self.add_training_data(service_name, metric_type, value)

        if key not in self.trained or not self.trained[key]:
            trained = self.train_model(service_name, metric_type)
            if not trained:
                return False, 0.0, value, 0.0

        model = self.models[key]
        X = np.array([[value]])

        prediction = model.predict(X)[0]
        anomaly_score = model.score_samples(X)[0]

        is_anomaly = prediction == -1

        expected_value = np.mean(self.training_data[key])
        deviation = ((value - expected_value) / expected_value) * 100 if expected_value != 0 else 0

        confidence = self._calculate_confidence(anomaly_score, deviation)

        return is_anomaly, anomaly_score, expected_value, deviation, confidence

    def _calculate_confidence(self, anomaly_score: float, deviation: float) -> float:
        score_confidence = min(abs(anomaly_score) * 100, 100)
        deviation_confidence = min(abs(deviation), 100)

        confidence = (score_confidence * 0.6) + (deviation_confidence * 0.4)

        return min(confidence, 100.0)

    def get_model_stats(self, service_name: str, metric_type: str) -> Dict:
        key = self.get_model_key(service_name, metric_type)

        if key not in self.training_data:
            return {"status": "no_data"}

        data = self.training_data[key]

        return {
            "status": "trained" if self.trained.get(key, False) else "training",
            "samples": len(data),
            "mean": np.mean(data),
            "std": np.std(data),
            "min": np.min(data),
            "max": np.max(data)
        }

detector = AnomalyDetector(contamination=0.15)

def analyze_metric(service_name: str, metric_type: str, value: float) -> Dict:
    is_anomaly, score, expected, deviation, confidence = detector.detect_anomaly(
        service_name, metric_type, value
    )

    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": float(score),
        "expected_value": float(expected),
        "actual_value": float(value),
        "deviation": float(deviation),
        "confidence": float(confidence),
        "detection_method": "isolation_forest"
    }
