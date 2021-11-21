import { Button, ContextualMenu } from "@canonical/react-components";
import { useSelector } from "react-redux";

import ModelListSubtitle from "app/base/components/ModelListSubtitle";
import SectionHeader from "app/base/components/SectionHeader";
import DeviceHeaderForms from "app/devices/components/DeviceHeaderForms";
import { DeviceHeaderViews } from "app/devices/constants";
import type {
  DeviceHeaderContent,
  DeviceSetHeaderContent,
} from "app/devices/types";
import { getHeaderTitle } from "app/devices/utils";
import deviceSelectors from "app/store/device/selectors";

type Props = {
  headerContent: DeviceHeaderContent | null;
  setHeaderContent: DeviceSetHeaderContent;
};

const DeviceListHeader = ({
  headerContent,
  setHeaderContent,
}: Props): JSX.Element => {
  const devices = useSelector(deviceSelectors.all);
  const devicesLoaded = useSelector(deviceSelectors.loaded);

  return (
    <SectionHeader
      buttons={[
        <Button
          appearance="neutral"
          data-test="add-device-button"
          onClick={() =>
            setHeaderContent({ view: DeviceHeaderViews.ADD_DEVICE })
          }
        >
          Add device
        </Button>,
        // TODO: Make machine TakeActionMenu generic and use here instead.
        // https://github.com/canonical-web-and-design/app-tribe/issues/524
        <ContextualMenu
          hasToggleIcon
          toggleAppearance="positive"
          toggleDisabled
          toggleLabel="Take action"
        />,
      ]}
      headerContent={
        headerContent && (
          <DeviceHeaderForms
            headerContent={headerContent}
            setHeaderContent={setHeaderContent}
          />
        )
      }
      subtitle={
        <ModelListSubtitle available={devices.length} modelName="device" />
      }
      subtitleLoading={!devicesLoaded}
      title={getHeaderTitle("Devices", headerContent)}
    />
  );
};

export default DeviceListHeader;