import {
  cancelAdoptionRequest,
  completeAdoption,
  createAdoptionRequest,
  getMyAdoptionRequests,
  getReceivedAdoptionRequests,
  updateAdoptionRequestStatus,
} from "../services/adoption.service.js";

export const createRequest = async (req, res, next) => {
  try {
    const request = await createAdoptionRequest(
      req.user.id,
      req.params.petId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Adoption request submitted successfully",
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyRequests = async (req, res, next) => {
  try {
    const requests = await getMyAdoptionRequests(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const getReceivedRequests = async (
  req,
  res,
  next
) => {
  try {
    const requests =
      await getReceivedAdoptionRequests(req.user.id);

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    next(error);
  }
};

export const updateRequestStatus = async (
  req,
  res,
  next
) => {
  try {
    const request = await updateAdoptionRequestStatus(
      req.params.requestId,
      req.user.id,
      req.body.status
    );

    return res.status(200).json({
      success: true,
      message: `Adoption request ${req.body.status.toLowerCase()}`,
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const completeAdoptionRequest = async (
  req,
  res,
  next
) => {
  try {
    const { requestId } = req.params;

    const result = await completeAdoption(
      requestId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Adoption completed successfully",
      request: result,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelRequest = async (
  req,
  res,
  next
) => {
  try {
    const { requestId } = req.params;

    const request = await cancelAdoptionRequest(
      requestId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Adoption request cancelled successfully",
      request,
    });
  } catch (error) {
    next(error);
  }
};