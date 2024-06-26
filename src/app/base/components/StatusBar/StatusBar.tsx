import type { ReactNode } from "react";

import { Button, Link } from "@canonical/react-components";
import { useSelector } from "react-redux";

import { useUsabilla } from "@/app/base/hooks";
import configSelectors from "@/app/store/config/selectors";
import controllerSelectors from "@/app/store/controller/selectors";
import {
  isControllerDetails,
  isRack,
  isRegionAndRack,
} from "@/app/store/controller/utils";
import { version as versionSelectors } from "@/app/store/general/selectors";
import machineSelectors from "@/app/store/machine/selectors";
import type { MachineDetails } from "@/app/store/machine/types";
import {
  isDeployedWithHardwareSync,
  isMachineDetails,
} from "@/app/store/machine/utils";
import type { UtcDatetime } from "@/app/store/types/model";
import { NodeStatus } from "@/app/store/types/node";
import { formatUtcDatetime, getTimeDistanceString } from "@/app/utils/time";

const getLastCommissionedString = (machine: MachineDetails) => {
  if (machine.status === NodeStatus.COMMISSIONING) {
    return "Commissioning in progress...";
  } else if (machine.commissioning_start_time === "") {
    return "Not yet commissioned";
  }
  try {
    const distance = getTimeDistanceString(machine.commissioning_start_time);
    return `Last commissioned: ${distance}`;
  } catch (error) {
    return `Unable to parse commissioning timestamp (${
      error instanceof Error ? error.message : error
    })`;
  }
};

const getSyncStatusString = (syncStatus: UtcDatetime) => {
  if (syncStatus === "") {
    return "Never";
  }
  try {
    return getTimeDistanceString(syncStatus);
  } catch (error) {
    return `Unable to parse sync timestamp (${
      error instanceof Error ? error.message : error
    })`;
  }
};

export const StatusBar = (): JSX.Element | null => {
  const activeController = useSelector(controllerSelectors.active);
  const activeMachine = useSelector(machineSelectors.active);
  const version = useSelector(versionSelectors.get);
  const maasName = useSelector(configSelectors.maasName);
  const allowUsabilla = useUsabilla();

  if (!(maasName && version)) {
    return null;
  }

  let status: ReactNode;
  if (isMachineDetails(activeMachine)) {
    const statuses = [activeMachine.fqdn];
    if (isDeployedWithHardwareSync(activeMachine)) {
      statuses.push(
        `Last synced: ${getSyncStatusString(activeMachine.last_sync)}`
      );
      statuses.push(
        `Next sync: ${getSyncStatusString(activeMachine.next_sync)}`
      );
    } else {
      statuses.push(getLastCommissionedString(activeMachine));
    }
    status = (
      <ul className="p-inline-list u-flex--wrap u-no-margin--bottom">
        {statuses.map((status, i) => (
          <li className="p-inline-list__item" key={status}>
            {i === 0 ? <strong>{status}</strong> : status}
          </li>
        ))}
      </ul>
    );
  } else if (
    isControllerDetails(activeController) &&
    (isRack(activeController) || isRegionAndRack(activeController))
  ) {
    status = `Last image sync: ${formatUtcDatetime(
      activeController.last_image_sync
    )}`;
  }

  return (
    <aside aria-label="status bar" className="p-status-bar">
      <div className="p-status-bar__row u-flex">
        <div className="p-status-bar__primary u-flex--no-shrink u-flex--wrap">
          <strong data-testid="status-bar-maas-name">{maasName} MAAS</strong>
          :&nbsp;
          <span data-testid="status-bar-version">{version}</span>
        </div>
        <ul className="p-inline-list--middot u-no-margin--bottom">
          <li className="p-inline-list__item">
            <Link
              href={`${import.meta.env.VITE_APP_BASENAME}/docs/`}
              rel="noreferrer"
              target="_blank"
            >
              Local documentation
            </Link>
          </li>
          <li className="p-inline-list__item">
            <Link
              href="https://www.ubuntu.com/legal"
              rel="noreferrer"
              target="_blank"
            >
              Legal information
            </Link>
          </li>
          {allowUsabilla ? (
            <li className="p-inline-list__item">
              <Button
                appearance="link"
                className="u-no-margin u-no-padding"
                onClick={() => window.usabilla_live("click")}
              >
                Give feedback
              </Button>
            </li>
          ) : null}
        </ul>
        {status && (
          <div
            className="p-status-bar__secondary u-flex--grow u-flex--wrap"
            data-testid="status-bar-status"
          >
            {status}
          </div>
        )}
      </div>
    </aside>
  );
};

export default StatusBar;
