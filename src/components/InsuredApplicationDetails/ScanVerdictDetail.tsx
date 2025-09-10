import React from "react";
import ModalWindow from "components/ModalWindow";
import { PrettyPrint } from "utils";
import { scanVerdictDetails } from "utils/const";
import { useScanVerdictResultQuery } from "generated/graphql";
import ErrorToast from "components/Toast/ErrorToast";
import { LoadingJSONObject } from "components/ContentLoaders";

interface ScanVerdictDetailModalProps {
  showModal?: boolean;
  setShowModal?: any;
  external_id?: string;
}

const ScanVerdictDetailModal = (props: ScanVerdictDetailModalProps) => {
  const { showModal, setShowModal, external_id } = props;

  const [scanData, setScanData] = React.useState(null);

  const { data, loading, error } = useScanVerdictResultQuery({
    variables: {
      external_id: external_id,
    },
    skip: external_id === undefined ? true : false,
  });

  React.useEffect(() => {
    setScanData(data?.getScanResult?.connector_results);
  }, [data?.getScanResult?.connector_results]);

  return (
    <>
      <ErrorToast
        error={error}
        processCustomError={() => `Error - ${error?.message}`}
      />
      {showModal && (
        <ModalWindow
          showModal={showModal}
          size="sm"
          title="Scan Verdict Details"
          setShowModal={() => setShowModal(false)}
        >
          {loading && (
            <>
              <LoadingJSONObject />
              <LoadingJSONObject />
            </>
          )}

          <PrettyPrint jsonObj={scanData} />
        </ModalWindow>
      )}
    </>
  );
};

export default React.memo(ScanVerdictDetailModal);
