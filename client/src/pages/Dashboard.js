import React, { useEffect, useState } from "react";
import styled from "styled-components";
import API from "../services/api";
import PageContainer from "../components/PageContainer";

import {
  MetricGrid,
  MetricCard,
  MetricLabel,
  MetricValue,
  MetricSub,
  Card,
  CardHead,
  CardTitle,
} from "../components/Card";

/* ─── Page ─── */
const PageWrap = styled.div`
  padding: 16px;
  width: 100%;
  max-width: 900px;

  @media (min-width: 600px) { padding: 20px; }
`;

/* ─── Table ─── */
const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 340px;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  font-size: 11px;
  color: #8b909c;
  padding: 9px 14px;
  background: #f7f8fa;
`;

const Td = styled.td`
  padding: 10px 14px;
  border-bottom: 1px solid #e4e6eb;
`;

const QtyBold = styled.span`
  font-weight: 500;
`;  

const AlertRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  margin-bottom: 8px;
`;

const AlertName = styled.span`
  font-weight: 500;
  font-size: 13px;
`;

/* ─── Badge ─── */
const Badge = styled.span`
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 20px;

  ${({ variant }) =>
    variant === "purchase" && "background:#eef3ff;color:#1a3a8b;"}
  ${({ variant }) =>
    variant === "sale" && "background:#f5f0ff;color:#4a1a8b;"}
  ${({ variant }) =>
    variant === "out" && "background:#fff5f5;color:#8b1a1a;"}
`;

/* ─── Misc ─── */
const Empty = styled.div`
  text-align: center;
  padding: 28px 0;
  color: #8b909c;
`;

const CountPill = styled.span`
  font-size: 11px;
  color: #8b909c;
`;

/* ═══════════════════════════════════════════════════════ */

const Dashboard = () => {
  const [summary, setSummary] = useState({});
  const [activity, setActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [invRes, salesRes, purRes] = await Promise.all([
        API.get("/inventory"),
        API.get("/sales"),
        API.get("/purchase"),
      ]);

      const inventory = invRes.data || [];
      const sales = salesRes.data || [];
      const purchases = purRes.data || [];

      const totalStock = inventory.reduce(
        (sum, i) => sum + (i.stock || 0),
        0
      );

      const todayStr = new Date().toDateString();

      const salesToday = sales.filter(
        (s) => new Date(s.created_at).toDateString() === todayStr
      );

      const purchasesToday = purchases.filter(
        (p) => new Date(p.created_at).toDateString() === todayStr
      );

      const alertsList = inventory.filter((i) => (i.stock || 0) === 0);

      setSummary({
        totalStock,
        totalProducts: inventory.length,
        salesToday: salesToday.length,
        purchasesToday: purchasesToday.length,
        outOfStock: alertsList.length,
      });

      const recent = [
        ...purchases.map((p) => ({ ...p, type: "purchase" })),
        ...sales.map((s) => ({ ...s, type: "sale" })),
      ]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 6);

      setActivity(recent);
      setAlerts(alertsList);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) return <PageWrap><Empty>Loading...</Empty></PageWrap>;

  return (
  <PageContainer>

      <MetricGrid>
        <MetricCard accent>
          <MetricLabel>Total stock</MetricLabel>

          {/* ✅ FIXED */}
          <MetricValue green>
            {(summary.totalStock ?? 0).toFixed(1)}
            <span style={{ fontSize: 14, color: "#8b909c" }}>
              {" "}mixed
            </span>
          </MetricValue>

          <MetricSub>{summary.totalProducts} products</MetricSub>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Sales today</MetricLabel>
          <MetricValue>{summary.salesToday}</MetricValue>
          <MetricSub>transactions</MetricSub>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Purchases today</MetricLabel>
          <MetricValue>{summary.purchasesToday}</MetricValue>
          <MetricSub>restocks</MetricSub>
        </MetricCard>

        <MetricCard>
          <MetricLabel>Alerts</MetricLabel>
          <MetricValue>{summary.outOfStock}</MetricValue>
          <MetricSub>out of stock</MetricSub>
        </MetricCard>
      </MetricGrid>

      {/* ── Activity ── */}
      <Card>
        <CardHead>
          <CardTitle>Recent activity</CardTitle>
          <CountPill>{activity.length}</CountPill>
        </CardHead>

        {activity.length === 0 ? (
          <Empty>No activity</Empty>
        ) : (
          <TableScroll>
            <Table>
              <thead>
                <tr>
                  <Th>Type</Th>
                  <Th>Product</Th>
                  <Th>Qty</Th> {/* ✅ FIXED */}
                </tr>
              </thead>

              <tbody>
                {activity.map((r) => (
                  <tr key={r.id}>
                    <Td>
                      <Badge variant={r.type}>{r.type}</Badge>
                    </Td>

                    <Td>{r.product_name || "—"}</Td>

                    <Td>
                      <QtyBold>
                        {r.type === "purchase"
                          ? `${r.usable_weight} ${r.unit || ""}`
                          : `${r.sold_weight} ${r.unit || ""}`}
                      </QtyBold>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableScroll>
        )}
      </Card>

      {/* ── Alerts ── */}
      <Card>
        <CardHead>
          <CardTitle>Stock alerts</CardTitle>
        </CardHead>

              {alerts.length === 0 ? (
        <Empty style={{ padding: "18px 0" }}>
          All products are well stocked
        </Empty>
      ) : (
        alerts.map((p) => (
          <AlertRow key={p.productId}>
            <AlertName>{p.name}</AlertName>

            <Badge variant={p.stock === 0 ? "out" : "low"}>
              {p.unit === "kg"
                ? `${(p.stock ?? 0).toFixed(2)} kg`
                : `${p.stock ?? 0} pcs`}
              {" — "}
              {p.stock === 0 ? "Out of stock" : "Low stock"}
            </Badge>
          </AlertRow>
        ))
      )}
      </Card>

    </PageContainer>
  );
};

export default Dashboard;