from typing import Dict, Optional
from datetime import datetime
import asyncio

class RemediationEngine:
    def __init__(self):
        self.remediations = {}
        self.cpu_threshold = 90.0
        self.memory_threshold = 90.0

    async def evaluate_and_remediate(
        self,
        service_name: str,
        metric_type: str,
        current_value: float,
        trigger_type: str = "alert",
        trigger_id: Optional[str] = None
    ) -> Optional[Dict]:
        should_remediate = False
        action_type = None

        if metric_type == "cpu" and current_value > self.cpu_threshold:
            should_remediate = True
            action_type = "restart_pod"
        elif metric_type == "memory" and current_value > self.memory_threshold:
            should_remediate = True
            action_type = "restart_pod"

        if not should_remediate:
            return None

        remediation_id = f"rem-{service_name}-{datetime.utcnow().timestamp()}"

        remediation = {
            "id": remediation_id,
            "service_name": service_name,
            "trigger_type": trigger_type,
            "trigger_id": trigger_id,
            "action_type": action_type,
            "metric_type": metric_type,
            "metric_value": current_value,
            "status": "pending",
            "started_at": datetime.utcnow().isoformat(),
            "action_details": {}
        }

        self.remediations[remediation_id] = remediation

        asyncio.create_task(self._execute_remediation(remediation_id))

        return remediation

    async def _execute_remediation(self, remediation_id: str):
        remediation = self.remediations.get(remediation_id)
        if not remediation:
            return

        remediation["status"] = "in_progress"

        try:
            action_type = remediation["action_type"]

            if action_type == "restart_pod":
                result = await self._restart_pod(
                    remediation["service_name"],
                    remediation.get("metric_type", "unknown")
                )
            elif action_type == "scale_up":
                result = await self._scale_up(remediation["service_name"])
            elif action_type == "rollback":
                result = await self._rollback(remediation["service_name"])
            else:
                result = {"success": False, "error": "Unknown action type"}

            if result.get("success"):
                remediation["status"] = "success"
                remediation["action_details"] = result.get("details", {})
            else:
                remediation["status"] = "failed"
                remediation["error_message"] = result.get("error", "Unknown error")

        except Exception as e:
            remediation["status"] = "failed"
            remediation["error_message"] = str(e)

        remediation["completed_at"] = datetime.utcnow().isoformat()

    async def _restart_pod(self, service_name: str, metric_type: str) -> Dict:
        await asyncio.sleep(2)

        pod_name = f"{service_name}-pod-{hash(service_name) % 10000}"

        return {
            "success": True,
            "details": {
                "pod_name": pod_name,
                "namespace": "production",
                "action": "restarted",
                "reason": f"{metric_type}_threshold_exceeded",
                "timestamp": datetime.utcnow().isoformat()
            }
        }

    async def _scale_up(self, service_name: str) -> Dict:
        await asyncio.sleep(3)

        return {
            "success": True,
            "details": {
                "service": service_name,
                "previous_replicas": 2,
                "new_replicas": 4,
                "namespace": "production"
            }
        }

    async def _rollback(self, service_name: str) -> Dict:
        await asyncio.sleep(2)

        return {
            "success": True,
            "details": {
                "service": service_name,
                "previous_version": "v2.1.3",
                "rolled_back_to": "v2.1.2",
                "namespace": "production"
            }
        }

    def get_remediation_status(self, remediation_id: str) -> Optional[Dict]:
        return self.remediations.get(remediation_id)

    def get_all_remediations(self, service_name: Optional[str] = None) -> list:
        if service_name:
            return [
                r for r in self.remediations.values()
                if r["service_name"] == service_name
            ]
        return list(self.remediations.values())

engine = RemediationEngine()
