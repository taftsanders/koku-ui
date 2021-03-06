import './reportSummaryAlt.scss';

import { Card, CardBody, CardFooter, CardTitle, Grid, GridItem, Title } from '@patternfly/react-core';
import { Skeleton } from '@redhat-cloud-services/frontend-components/components/Skeleton';
import React from 'react';
import { InjectedTranslateProps, translate } from 'react-i18next';
import { FetchStatus } from 'store/common';

interface OcpCloudReportSummaryAltProps extends InjectedTranslateProps {
  children?: React.ReactNode;
  detailsLink?: React.ReactNode;
  status: number;
  subTitle?: string;
  tabs?: React.ReactNode;
  title: string;
}

const OcpCloudReportSummaryAltBase: React.SFC<OcpCloudReportSummaryAltProps> = ({
  children,
  detailsLink,
  status,
  subTitle,
  tabs,
  title,
}) => (
  <Card className="reportSummary">
    <Grid hasGutter>
      <GridItem lg={5} xl={6}>
        <div className="cost">
          <CardTitle>
            <Title headingLevel="h2" size="lg">
              {title}
            </Title>
            {Boolean(subTitle) && <p className="subtitle">{subTitle}</p>}
          </CardTitle>
          <CardBody>
            {status === FetchStatus.inProgress ? (
              <>
                <Skeleton size="xs" />
                <Skeleton className="chartSkeleton" size="md" />
                <Skeleton size="sm" />
                <Skeleton className="legendSkeleton" size="xs" />
              </>
            ) : (
              children
            )}
          </CardBody>
        </div>
      </GridItem>
      <GridItem lg={7} xl={6}>
        <div className="container">
          <div className="tops">
            {status !== FetchStatus.inProgress && (
              <>
                {Boolean(tabs) && <CardBody>{tabs}</CardBody>}
                {Boolean(detailsLink) && <CardFooter>{detailsLink}</CardFooter>}
              </>
            )}
          </div>
        </div>
      </GridItem>
    </Grid>
  </Card>
);

const ReportSummaryAlt = translate()(OcpCloudReportSummaryAltBase);

export { ReportSummaryAlt, OcpCloudReportSummaryAltProps };
