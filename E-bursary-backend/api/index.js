module.exports = function(req, res) {
  res.status(200).json({
    message: 'e-bursary API',
    time: Date.now()
  });
};


/**
 * Vercel Serverless Handler
 */

exports.default = function(req, res) {
  res.status(200).json({
    message: 'e-bursary API',
    time: Date.now()
  });
};


  } catch (error) {
    console.error('[Serverless Handler Error]', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'Server initialization failed' : String(error),
    });
  }
};


