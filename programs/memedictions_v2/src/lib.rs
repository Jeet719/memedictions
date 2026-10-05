use anchor_lang::prelude::*;

declare_id!("6ePYpybRkB9EBZetcprsxXuxZbVF2xv9qcBUgd6nahfy");

#[program]
pub mod memedictions_v2 {
    use super::*;

    pub fn initialize_round(
        ctx: Context<InitializeRound>,
        round_id: u64,
        market: String,
        closing_time: i64,
        opening_price: i64,
        opening_price_timestamp: i64,
    ) -> Result<()> {
        require!(
            market.len() >= 2 &&
            market.len() <= 16 &&
            market.bytes().all(
                |b| b.is_ascii_uppercase() ||
                b.is_ascii_digit()
            ),
            MemedictionsError::InvalidMarket
        );

        require!(
            opening_price > 0,
            MemedictionsError::InvalidPrice
        );

        let now =
            Clock::get()?.unix_timestamp;

        require!(
            closing_time > now,
            MemedictionsError::InvalidClosingTime
        );

        let duration =
            closing_time
                .checked_sub(now)
                .ok_or(
                    MemedictionsError::InvalidClosingTime
                )?;

        require!(
            duration >= 60,
            MemedictionsError::InvalidClosingTime
        );

        require!(
            duration <= 604_800,
            MemedictionsError::InvalidClosingTime
        );

        require!(
            opening_price_timestamp <= now,
            MemedictionsError::InvalidPriceTimestamp
        );

        let opening_price_age =
            now
                .checked_sub(opening_price_timestamp)
                .ok_or(
                    MemedictionsError::InvalidPriceTimestamp
                )?;

        require!(
            opening_price_age <= 60,
            MemedictionsError::InvalidPriceTimestamp
        );

        let round =
            &mut ctx.accounts.round;

        round.authority =
            ctx.accounts.authority.key();

        round.round_id =
            round_id;

        round.market =
            market;

        round.closing_time =
            closing_time;

        round.prediction_count =
            0;

        round.opening_price =
            opening_price;

        round.opening_price_timestamp =
            opening_price_timestamp;

        round.bump =
            ctx.bumps.round;

        Ok(())
    }

    pub fn submit_prediction(
        ctx: Context<SubmitPrediction>,
        direction: u8,
        points: u64,
    ) -> Result<()> {
        require!(
            direction <= 1,
            MemedictionsError::InvalidDirection
        );

        require!(
            points > 0 &&
            points <= 10_000,
            MemedictionsError::InvalidPoints
        );

        let now =
            Clock::get()?.unix_timestamp;

        require!(
            now <
            ctx.accounts.round.closing_time,
            MemedictionsError::RoundClosed
        );

        let prediction =
            &mut ctx.accounts.prediction;

        prediction.round =
            ctx.accounts.round.key();

        prediction.user =
            ctx.accounts.user.key();

        prediction.direction =
            direction;

        prediction.points =
            points;

        prediction.timestamp =
            now;

        prediction.bump =
            ctx.bumps.prediction;

        ctx.accounts.round.prediction_count =
            ctx.accounts.round
                .prediction_count
                .checked_add(1)
                .ok_or(
                    MemedictionsError::MathOverflow
                )?;

        Ok(())
    }

    pub fn close_round(
        ctx: Context<CloseRound>,
        closing_price: i64,
        closing_price_timestamp: i64,
    ) -> Result<()> {
        require!(
            closing_price > 0,
            MemedictionsError::InvalidPrice
        );

        let now =
            Clock::get()?.unix_timestamp;

        require!(
            now >=
            ctx.accounts.round.closing_time,
            MemedictionsError::RoundStillOpen
        );

        require!(
            closing_price_timestamp >=
            ctx.accounts.round.closing_time,
            MemedictionsError::InvalidPriceTimestamp
        );

        require!(
            closing_price_timestamp <= now,
            MemedictionsError::InvalidPriceTimestamp
        );

        let closing_price_delay =
            closing_price_timestamp
                .checked_sub(
                    ctx.accounts.round.closing_time
                )
                .ok_or(
                    MemedictionsError::InvalidPriceTimestamp
                )?;

        require!(
            closing_price_delay <= 60,
            MemedictionsError::InvalidPriceTimestamp
        );

        let outcome =
            if closing_price >
                ctx.accounts.round.opening_price
            {
                0
            } else if closing_price <
                ctx.accounts.round.opening_price
            {
                1
            } else {
                2
            };

        let result =
            &mut ctx.accounts.round_result;

        result.round =
            ctx.accounts.round.key();

        result.authority =
            ctx.accounts.authority.key();

        result.opening_price =
            ctx.accounts.round.opening_price;

        result.closing_price =
            closing_price;

        result.outcome =
            outcome;

        result.closed_at =
            now;

        result.closing_price_timestamp =
            closing_price_timestamp;

        result.bump =
            ctx.bumps.round_result;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(round_id: u64)]
pub struct InitializeRound<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Round::INIT_SPACE,
        seeds = [
            b"round",
            authority.key().as_ref(),
            &round_id.to_le_bytes()
        ],
        bump
    )]
    pub round:
        Account<'info, Round>,

    #[account(mut)]
    pub authority:
        Signer<'info>,

    pub system_program:
        Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitPrediction<'info> {
    #[account(mut)]
    pub round:
        Account<'info, Round>,

    #[account(
        init,
        payer = user,
        space = 8 + Prediction::INIT_SPACE,
        seeds = [
            b"prediction",
            round.key().as_ref(),
            user.key().as_ref()
        ],
        bump
    )]
    pub prediction:
        Account<'info, Prediction>,

    #[account(mut)]
    pub user:
        Signer<'info>,

    pub system_program:
        Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseRound<'info> {
    pub round:
        Account<'info, Round>,

    #[account(
        init,
        payer = authority,
        space = 8 + RoundResult::INIT_SPACE,
        seeds = [
            b"round_result",
            round.key().as_ref()
        ],
        bump
    )]
    pub round_result:
        Account<'info, RoundResult>,

    #[account(
        mut,
        address = round.authority
    )]
    pub authority:
        Signer<'info>,

    pub system_program:
        Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Round {
    pub authority:
        Pubkey,

    pub round_id:
        u64,

    #[max_len(16)]
    pub market:
        String,

    pub closing_time:
        i64,

    pub prediction_count:
        u64,

    pub opening_price:
        i64,

    pub opening_price_timestamp:
        i64,

    pub bump:
        u8,
}

#[account]
#[derive(InitSpace)]
pub struct Prediction {
    pub round:
        Pubkey,

    pub user:
        Pubkey,

    pub direction:
        u8,

    pub points:
        u64,

    pub timestamp:
        i64,

    pub bump:
        u8,
}

#[account]
#[derive(InitSpace)]
pub struct RoundResult {
    pub round:
        Pubkey,

    pub authority:
        Pubkey,

    pub opening_price:
        i64,

    pub closing_price:
        i64,

    pub outcome:
        u8,

    pub closed_at:
        i64,

    pub closing_price_timestamp:
        i64,

    pub bump:
        u8,
}

#[error_code]
pub enum MemedictionsError {
    #[msg("Mercado invalido")]
    InvalidMarket,

    #[msg("Direccion invalida")]
    InvalidDirection,

    #[msg("Puntos invalidos")]
    InvalidPoints,

    #[msg("Ronda cerrada")]
    RoundClosed,

    #[msg("Ronda abierta")]
    RoundStillOpen,

    #[msg("Precio invalido")]
    InvalidPrice,

    #[msg("Timestamp invalido")]
    InvalidPriceTimestamp,

    #[msg("Cierre invalido")]
    InvalidClosingTime,

    #[msg("Overflow")]
    MathOverflow,
}
