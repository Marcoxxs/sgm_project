import { Box, ButtonBase, Tooltip, Typography } from "@mui/material";
import { formatComputer } from "../../domain/sessions/labs";
import { computerStatus } from "./computerStatus";

export default function ComputerStation({ computer, session, onSelect }) {
  const { label, image } = computerStatus[computer.status];
  const name = formatComputer(computer.number);

  return (
    <Tooltip
      describeChild
      title={session ? (
        <>
          <strong>{session.personName}</strong>
          <br />
          {session.personIdentifier}
        </>
      ) : ""}
    >
      <ButtonBase
        onClick={() => onSelect(computer.id)}
        aria-label={`${name} — ${label}`}
        data-computer-id={computer.id}
        sx={{
          display: "flex", flexDirection: "column", gap: 0.75, minWidth: 0, minHeight: 92, py: 1,
          bgcolor: "background.paper", border: 1, borderColor: "divider", borderRadius: 1,
          "&:hover, &.Mui-focusVisible": { borderColor: "primary.main", color: "primary.dark" },
        }}
      >
        <Box
          component="img"
          src={`${import.meta.env.BASE_URL}${image}`}
          alt=""
          draggable={false}
          sx={{ width: 44, height: 51, objectFit: "contain" }}
        />
        <Typography component="span" variant="body2" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {name}
        </Typography>
      </ButtonBase>
    </Tooltip>
  );
}
