import { upgradeWorkstation as applyRule, UpgradeWorkstationResult } from "../../domain/rules/upgradeWorkstation";

import { GameStore } from "../store/GameStore";

export function createUpgradeWorkstationUseCase(
    store: GameStore
) {
    return (workstationId: string): UpgradeWorkstationResult => {
            let result: UpgradeWorkstationResult = {
                ok: false,
                error: 'WORKSTATION_NOT_FOUND',
            };
    
            store.update(state => {
                result = applyRule(state, workstationId);
    
                return result.ok ? result.state : state;
            });
    
            return result;
        };
}