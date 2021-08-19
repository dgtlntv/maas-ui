import { useEffect, useState } from "react";

import { Button, Col, Notification, Row } from "@canonical/react-components";
import pluralize from "pluralize";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import machineURLs from "app/machines/urls";
import machineSelectors from "app/store/machine/selectors";
import type { Machine, MachineDetails } from "app/store/machine/types";
import type { RootState } from "app/store/root/types";
import { NodeActions } from "app/store/types/node";

type CloneError =
  | null
  | string
  | {
      destinations: {
        code: string;
        message: string;
      }[];
    };

type Props = {
  closeForm: () => void;
  destinations: Machine["system_id"][];
  sourceMachine: MachineDetails | null;
};

const getResultsString = (count: number, error: CloneError) => {
  let successCount: number;
  if (!error) {
    successCount = count;
  } else if (typeof error === "object" && "destinations" in error) {
    successCount = count - error.destinations.length;
  } else {
    // If an error is returned and it's not tied to the selected destinations,
    // assume the error is global and therefore no machines were cloned to
    // successfully.
    successCount = 0;
  }

  return `${successCount} of ${pluralize(
    "machine",
    count,
    true
  )} cloned successfully from`;
};

export const CloneResults = ({
  closeForm,
  destinations,
  sourceMachine,
}: Props): JSX.Element | null => {
  const [destinationCount, setDestinationCount] = useState(0);
  const cloneErrors = useSelector((state: RootState) =>
    machineSelectors.eventErrorsForIds(
      state,
      sourceMachine?.system_id || "",
      NodeActions.CLONE
    )
  );
  const error: CloneError = cloneErrors.length ? cloneErrors[0].error : null;

  useEffect(() => {
    // We set destination count in local state otherwise the user could unselect
    // machines and change the results.
    if (!destinationCount) {
      setDestinationCount(destinations.length);
    }
  }, [destinationCount, destinations.length]);

  if (!sourceMachine) {
    return null;
  }

  return (
    <Row>
      <Col size={3}>
        <h2 className="p-heading--4">Cloning complete</h2>
      </Col>
      <Col size={6}>
        <p data-test="results-string">
          {getResultsString(destinationCount, error)}{" "}
          <Link to={machineURLs.machine.index({ id: sourceMachine.system_id })}>
            {sourceMachine.hostname}
          </Link>
          .
        </p>
        {error && (
          <>
            <p>The following errors occurred:</p>
            <Notification data-test="errors-table" severity="negative">
              Error
            </Notification>
          </>
        )}
      </Col>
      <hr />
      <div className="u-align--right">
        <Button appearance="base" onClick={closeForm}>
          Close
        </Button>
      </div>
    </Row>
  );
};

export default CloneResults;
